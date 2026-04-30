import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { STORAGE_KEYS } from '../utils/constants.js'
import { nowISO, saveJSON, uid } from '../utils/storage.js'
import {
  bootstrapInitialData,
  bulkReplaceBMs,
  bulkReplaceProfiles,
  deleteBMById,
  deleteProfileById,
  plantMockData,
  upsertBM,
  upsertProfile,
} from '../lib/repositories.js'
import { hasSupabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const DataContext = createContext(null)

// Migra status antigo (boa/mediana/ruim/bloqueada/preparacao) pra status (lifecycle)
// + qualidade (performance) novos. Idempotente: status já no formato novo passa.
const NEW_STATUSES = new Set(['criada', 'preparacao', 'aquecendo', 'usando', 'parada'])
const NEW_QUALITIES = new Set(['iniciante', 'ruim', 'mediana', 'boa', 'escala'])

function migrateAdAccountStatus(c) {
  const oldStatus = c?.status
  // Se já está no formato novo e qualidade existe, devolve como veio
  if (NEW_STATUSES.has(oldStatus) && NEW_QUALITIES.has(c?.qualidade)) {
    return { status: oldStatus, qualidade: c.qualidade }
  }
  // Se status novo mas qualidade ausente, default qualidade
  if (NEW_STATUSES.has(oldStatus)) {
    return { status: oldStatus, qualidade: c?.qualidade || 'iniciante' }
  }
  // Mapeamento legado → (status, qualidade)
  switch (oldStatus) {
    case 'boa':
      return { status: 'usando', qualidade: 'boa' }
    case 'mediana':
      return { status: 'usando', qualidade: 'mediana' }
    case 'ruim':
      return { status: 'usando', qualidade: 'ruim' }
    case 'bloqueada':
      return { status: 'usando', qualidade: 'ruim' }
    case 'preparacao':
    default:
      return { status: 'preparacao', qualidade: 'iniciante' }
  }
}

// Migra contas de anúncio do formato antigo (string) pro novo (objeto).
function normalizeBM(bm) {
  return {
    ...bm,
    contasAnuncio: (bm.contasAnuncio || []).map((c) => {
      if (typeof c === 'string') {
        return {
          nome: '',
          id: c,
          status: 'preparacao',
          qualidade: 'iniciante',
          tier: 't2',
          moeda: 'brl',
          observacao: '',
          logs: [],
        }
      }
      const { status, qualidade } = migrateAdAccountStatus(c)
      return {
        nome: c?.nome ?? '',
        id: c?.id ?? '',
        status,
        qualidade,
        tier: c?.tier ?? 't2',
        moeda: c?.moeda ?? 'brl',
        observacao: c?.observacao ?? '',
        logs: Array.isArray(c?.logs) ? c.logs : [],
      }
    }),
  }
}

export function DataProvider({ children }) {
  const { authed } = useAuth()
  const toast = useToast()
  const [profiles, setProfiles] = useState([])
  const [bms, setBMs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  // Persistência local: só persiste depois que os dados foram carregados.
  // No modo Supabase cada operação grava direto via repository.
  useEffect(() => {
    if (hasSupabase || !hydrated) return
    saveJSON(STORAGE_KEYS.PROFILES, profiles)
  }, [profiles, hydrated])

  useEffect(() => {
    if (hasSupabase || !hydrated) return
    saveJSON(STORAGE_KEYS.BMS, bms)
  }, [bms, hydrated])

  // Carga inicial — depende do estado de autenticação no modo Supabase.
  useEffect(() => {
    if (hasSupabase && !authed) {
      // Sem login no modo Supabase, não tenta buscar dados (RLS bloqueia)
      setProfiles([])
      setBMs([])
      setHydrated(false)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    bootstrapInitialData()
      .then((data) => {
        if (cancelled) return
        setProfiles(data.profiles || [])
        setBMs((data.bms || []).map(normalizeBM))
        setHydrated(true)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[DataContext] bootstrap error', err)
        setError(err)
        toast.error('Falha ao carregar dados. Verifique a conexão com o banco.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [authed, toast])

  // Helper para encapsular escrita remota com rollback otimista
  async function withRemote(operation, optimisticUpdate, rollback) {
    optimisticUpdate?.()
    try {
      await operation()
    } catch (err) {
      console.error('[DataContext] remote op failed', err)
      toast.error('Falha ao salvar no banco. Tentando recuperar estado local.')
      rollback?.(err)
    }
  }

  // ---------------- PERFIS ----------------
  const createProfile = useCallback(
    (data) => {
      const now = nowISO()
      const newProfile = {
        id: uid('p'),
        nome: '',
        codigoInterno: '',
        login: '',
        senha: '',
        twoFA: '',
        fornecedor: '',
        dataCompra: now,
        dataCriacaoFacebook: '',
        status: 'novo',
        nivelConfianca: 'medio',
        pais: 'Brasil',
        nacionalidade: 'br',
        proxy: '',
        telefone: '',
        bmVinculada: '',
        contaAnuncioVinculada: '',
        observacoes: '',
        tags: [],
        historico: [],
        notas: [],
        createdAt: now,
        updatedAt: now,
        ...data,
      }
      newProfile.historico = [
        ...(newProfile.historico || []),
        {
          id: uid('h'),
          tipo: 'criado',
          descricao: `Perfil cadastrado com status "${newProfile.status}".`,
          autor: 'admin',
          data: now,
        },
      ]
      withRemote(
        () => upsertProfile(newProfile),
        () => setProfiles((prev) => [newProfile, ...prev]),
        () => setProfiles((prev) => prev.filter((p) => p.id !== newProfile.id)),
      )
      return newProfile
    },
    [toast],
  )

  const updateProfile = useCallback(
    (id, patch, options = {}) => {
      let updatedProfile = null
      let original = null
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          original = p
          const updated = { ...p, ...patch, updatedAt: nowISO() }
          if (options.history) {
            updated.historico = [
              ...(p.historico || []),
              {
                id: uid('h'),
                autor: 'admin',
                data: nowISO(),
                ...options.history,
              },
            ]
          }
          updatedProfile = updated
          return updated
        }),
      )
      if (updatedProfile) {
        withRemote(
          () => upsertProfile(updatedProfile),
          null,
          () => {
            if (original) {
              setProfiles((prev) => prev.map((p) => (p.id === id ? original : p)))
            }
          },
        )
      }
    },
    [toast],
  )

  const moveProfileStatus = useCallback(
    (id, newStatus) => {
      let updated = null
      let original = null
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          if (p.status === newStatus) return p
          original = p
          const now = nowISO()
          updated = {
            ...p,
            status: newStatus,
            updatedAt: now,
            historico: [
              ...(p.historico || []),
              {
                id: uid('h'),
                tipo: 'status',
                descricao: `Perfil movido de "${p.status}" para "${newStatus}".`,
                autor: 'admin',
                data: now,
                from: p.status,
                to: newStatus,
              },
            ],
          }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertProfile(updated),
          null,
          () => {
            if (original) {
              setProfiles((prev) => prev.map((p) => (p.id === id ? original : p)))
            }
          },
        )
      }
    },
    [toast],
  )

  const addProfileNote = useCallback(
    (id, text) => {
      if (!text?.trim()) return
      let updated = null
      let original = null
      const now = nowISO()
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          original = p
          updated = {
            ...p,
            updatedAt: now,
            notas: [
              { id: uid('n'), texto: text.trim(), autor: 'admin', data: now },
              ...(p.notas || []),
            ],
            historico: [
              ...(p.historico || []),
              {
                id: uid('h'),
                tipo: 'nota',
                descricao: 'Nova anotação adicionada.',
                autor: 'admin',
                data: now,
              },
            ],
          }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertProfile(updated),
          null,
          () => {
            if (original) setProfiles((prev) => prev.map((p) => (p.id === id ? original : p)))
          },
        )
      }
    },
    [toast],
  )

  const deleteProfile = useCallback(
    (id) => {
      const original = profiles.find((p) => p.id === id)
      setProfiles((prev) => prev.filter((p) => p.id !== id))
      // limpa vínculos em BMs locais
      setBMs((prev) =>
        prev.map((b) => ({
          ...b,
          perfilDono: b.perfilDono === id ? '' : b.perfilDono,
          perfisVinculados: (b.perfisVinculados || []).filter((pid) => pid !== id),
        })),
      )
      withRemote(
        () => deleteProfileById(id),
        null,
        () => {
          if (original) setProfiles((prev) => [original, ...prev])
        },
      )
    },
    [profiles, toast],
  )

  // ---------------- BMs ----------------
  const createBM = useCallback(
    (data) => {
      const now = nowISO()
      const newBM = normalizeBM({
        id: uid('b'),
        nome: '',
        bmId: '',
        perfilDono: '',
        perfisVinculados: [],
        contasAnuncio: [],
        metodoPagamento: false,
        limiteDiario: '',
        status: 'nova',
        verificacao: 'nao_verificada',
        pais: 'Brasil',
        nacionalidade: 'br',
        dominios: [],
        paginas: [],
        observacoes: '',
        tags: [],
        historico: [],
        notas: [],
        createdAt: now,
        updatedAt: now,
        ...data,
      })
      newBM.historico = [
        ...(newBM.historico || []),
        {
          id: uid('h'),
          tipo: 'criado',
          descricao: `BM cadastrada com status "${newBM.status}".`,
          autor: 'admin',
          data: now,
        },
      ]
      withRemote(
        () => upsertBM(newBM),
        () => setBMs((prev) => [newBM, ...prev]),
        () => setBMs((prev) => prev.filter((b) => b.id !== newBM.id)),
      )
      return newBM
    },
    [toast],
  )

  const updateBM = useCallback(
    (id, patch, options = {}) => {
      let updated = null
      let original = null
      setBMs((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          original = b
          updated = normalizeBM({ ...b, ...patch, updatedAt: nowISO() })
          if (options.history) {
            updated.historico = [
              ...(b.historico || []),
              {
                id: uid('h'),
                autor: 'admin',
                data: nowISO(),
                ...options.history,
              },
            ]
          }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertBM(updated),
          null,
          () => {
            if (original) setBMs((prev) => prev.map((b) => (b.id === id ? original : b)))
          },
        )
      }
    },
    [toast],
  )

  const moveBMStatus = useCallback(
    (id, newStatus) => {
      let updated = null
      let original = null
      setBMs((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          if (b.status === newStatus) return b
          original = b
          const now = nowISO()
          updated = {
            ...b,
            status: newStatus,
            updatedAt: now,
            historico: [
              ...(b.historico || []),
              {
                id: uid('h'),
                tipo: 'status',
                descricao: `BM movida de "${b.status}" para "${newStatus}".`,
                autor: 'admin',
                data: now,
                from: b.status,
                to: newStatus,
              },
            ],
          }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertBM(updated),
          null,
          () => {
            if (original) setBMs((prev) => prev.map((b) => (b.id === id ? original : b)))
          },
        )
      }
    },
    [toast],
  )

  const addBMNote = useCallback(
    (id, text) => {
      if (!text?.trim()) return
      let updated = null
      let original = null
      const now = nowISO()
      setBMs((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          original = b
          updated = {
            ...b,
            updatedAt: now,
            notas: [
              { id: uid('n'), texto: text.trim(), autor: 'admin', data: now },
              ...(b.notas || []),
            ],
            historico: [
              ...(b.historico || []),
              {
                id: uid('h'),
                tipo: 'nota',
                descricao: 'Nova anotação adicionada.',
                autor: 'admin',
                data: now,
              },
            ],
          }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertBM(updated),
          null,
          () => {
            if (original) setBMs((prev) => prev.map((b) => (b.id === id ? original : b)))
          },
        )
      }
    },
    [toast],
  )

  const addAdAccountLog = useCallback(
    (bmId, adIndex, text) => {
      if (!text?.trim()) return
      const now = nowISO()
      let updated = null
      let original = null
      setBMs((prev) =>
        prev.map((b) => {
          if (b.id !== bmId) return b
          original = b
          const newContas = (b.contasAnuncio || []).map((c, i) => {
            if (i !== adIndex) return c
            return {
              ...c,
              logs: [
                {
                  id: uid('l'),
                  texto: text.trim(),
                  autor: 'admin',
                  data: now,
                },
                ...(c.logs || []),
              ],
            }
          })
          updated = { ...b, updatedAt: now, contasAnuncio: newContas }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertBM(updated),
          null,
          () => {
            if (original) {
              setBMs((prev) => prev.map((b) => (b.id === bmId ? original : b)))
            }
          },
        )
      }
    },
    [toast],
  )

  const deleteAdAccountLog = useCallback(
    (bmId, adIndex, logId) => {
      let updated = null
      let original = null
      setBMs((prev) =>
        prev.map((b) => {
          if (b.id !== bmId) return b
          original = b
          const newContas = (b.contasAnuncio || []).map((c, i) => {
            if (i !== adIndex) return c
            return { ...c, logs: (c.logs || []).filter((l) => l.id !== logId) }
          })
          updated = { ...b, updatedAt: nowISO(), contasAnuncio: newContas }
          return updated
        }),
      )
      if (updated) {
        withRemote(
          () => upsertBM(updated),
          null,
          () => {
            if (original) {
              setBMs((prev) => prev.map((b) => (b.id === bmId ? original : b)))
            }
          },
        )
      }
    },
    [toast],
  )

  const deleteBM = useCallback(
    (id) => {
      const original = bms.find((b) => b.id === id)
      setBMs((prev) => prev.filter((b) => b.id !== id))
      setProfiles((prev) =>
        prev.map((p) => (p.bmVinculada === id ? { ...p, bmVinculada: '' } : p)),
      )
      withRemote(
        () => deleteBMById(id),
        null,
        () => {
          if (original) setBMs((prev) => [original, ...prev])
        },
      )
    },
    [bms, toast],
  )

  // ---------------- BULK ----------------
  const replaceProfiles = useCallback(
    async (rows) => {
      const original = profiles
      setProfiles(rows)
      try {
        await bulkReplaceProfiles(rows)
      } catch (err) {
        console.error('[DataContext] replaceProfiles failed', err)
        toast.error('Falha ao substituir perfis no banco.')
        setProfiles(original)
      }
    },
    [profiles, toast],
  )

  const replaceBMs = useCallback(
    async (rows) => {
      const original = bms
      setBMs(rows.map(normalizeBM))
      try {
        await bulkReplaceBMs(rows)
      } catch (err) {
        console.error('[DataContext] replaceBMs failed', err)
        toast.error('Falha ao substituir BMs no banco.')
        setBMs(original)
      }
    },
    [bms, toast],
  )

  const resetData = useCallback(async () => {
    setLoading(true)
    try {
      const fresh = await plantMockData()
      setProfiles(fresh.profiles)
      setBMs(fresh.bms.map(normalizeBM))
      toast.success('Dados restaurados ao mock inicial.')
    } catch (err) {
      console.error('[DataContext] resetData failed', err)
      toast.error('Falha ao restaurar mock.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const value = useMemo(
    () => ({
      profiles,
      bms,
      loading,
      error,
      createProfile,
      updateProfile,
      moveProfileStatus,
      addProfileNote,
      deleteProfile,
      createBM,
      updateBM,
      moveBMStatus,
      addBMNote,
      addAdAccountLog,
      deleteAdAccountLog,
      deleteBM,
      replaceProfiles,
      replaceBMs,
      resetData,
    }),
    [
      profiles,
      bms,
      loading,
      error,
      createProfile,
      updateProfile,
      moveProfileStatus,
      addProfileNote,
      deleteProfile,
      createBM,
      updateBM,
      moveBMStatus,
      addBMNote,
      addAdAccountLog,
      deleteAdAccountLog,
      deleteBM,
      replaceProfiles,
      replaceBMs,
      resetData,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
