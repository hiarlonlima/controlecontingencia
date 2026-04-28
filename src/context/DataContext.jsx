import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STORAGE_KEYS } from '../utils/constants.js'
import { loadJSON, nowISO, saveJSON, uid } from '../utils/storage.js'
import { buildMockData } from '../utils/mockData.js'

const DataContext = createContext(null)

// Migra contas de anúncio do formato antigo (string) pro novo (objeto).
// Idempotente — entradas já no formato novo passam intactas.
function normalizeBM(bm) {
  return {
    ...bm,
    contasAnuncio: (bm.contasAnuncio || []).map((c) => {
      if (typeof c === 'string') {
        return { nome: '', id: c, status: 'preparacao', tier: 't2', observacao: '' }
      }
      return {
        nome: c?.nome ?? '',
        id: c?.id ?? '',
        status: c?.status ?? 'preparacao',
        tier: c?.tier ?? 't2',
        observacao: c?.observacao ?? '',
      }
    }),
  }
}

// Carga inicial síncrona — roda no primeiro render do provider e popula
// localStorage com mock se for a primeira vez. Idempotente.
function readInitialData() {
  const seeded = loadJSON(STORAGE_KEYS.SEEDED, false)
  if (seeded) {
    return {
      profiles: loadJSON(STORAGE_KEYS.PROFILES, []) || [],
      bms: (loadJSON(STORAGE_KEYS.BMS, []) || []).map(normalizeBM),
    }
  }
  const data = buildMockData()
  saveJSON(STORAGE_KEYS.PROFILES, data.profiles)
  saveJSON(STORAGE_KEYS.BMS, data.bms)
  saveJSON(STORAGE_KEYS.SEEDED, true)
  return data
}

export function DataProvider({ children }) {
  const initialRef = useRef(null)
  if (initialRef.current === null) initialRef.current = readInitialData()

  const [profiles, setProfiles] = useState(initialRef.current.profiles)
  const [bms, setBMs] = useState(initialRef.current.bms)

  // Pula a primeira execução pra evitar sobrescrever o seed em Strict Mode
  const skipFirstProfiles = useRef(true)
  useEffect(() => {
    if (skipFirstProfiles.current) {
      skipFirstProfiles.current = false
      return
    }
    saveJSON(STORAGE_KEYS.PROFILES, profiles)
  }, [profiles])

  const skipFirstBMs = useRef(true)
  useEffect(() => {
    if (skipFirstBMs.current) {
      skipFirstBMs.current = false
      return
    }
    saveJSON(STORAGE_KEYS.BMS, bms)
  }, [bms])

  // ---------------- PERFIS ----------------
  const createProfile = useCallback((data) => {
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
      proxy: '',
      telefone: '',
      bmVinculada: '',
      contaAnuncioVinculada: '',
      observacoes: '',
      tags: [],
      prioridade: 'media',
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
    setProfiles((prev) => [newProfile, ...prev])
    return newProfile
  }, [])

  const updateProfile = useCallback((id, patch, options = {}) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
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
        return updated
      }),
    )
  }, [])

  const moveProfileStatus = useCallback((id, newStatus) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        if (p.status === newStatus) return p
        const now = nowISO()
        return {
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
      }),
    )
  }, [])

  const addProfileNote = useCallback((id, text) => {
    if (!text?.trim()) return
    const now = nowISO()
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
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
              descricao: `Nova anotação adicionada.`,
              autor: 'admin',
              data: now,
            },
          ],
        }
      }),
    )
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    // limpa vínculos em BMs
    setBMs((prev) =>
      prev.map((b) => ({
        ...b,
        perfilDono: b.perfilDono === id ? '' : b.perfilDono,
        perfisVinculados: (b.perfisVinculados || []).filter((pid) => pid !== id),
      })),
    )
  }, [])

  // ---------------- BMs ----------------
  const createBM = useCallback((data) => {
    const now = nowISO()
    const newBM = {
      id: uid('b'),
      nome: '',
      bmId: '',
      perfilDono: '',
      perfisVinculados: [],
      contasAnuncio: [],
      metodoPagamento: false,
      limiteDiario: '',
      status: 'nova',
      pais: 'Brasil',
      dominios: [],
      paginas: [],
      observacoes: '',
      tags: [],
      prioridade: 'media',
      historico: [],
      notas: [],
      createdAt: now,
      updatedAt: now,
      ...data,
    }
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
    setBMs((prev) => [newBM, ...prev])
    return newBM
  }, [])

  const updateBM = useCallback((id, patch, options = {}) => {
    setBMs((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const updated = { ...b, ...patch, updatedAt: nowISO() }
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
  }, [])

  const moveBMStatus = useCallback((id, newStatus) => {
    setBMs((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        if (b.status === newStatus) return b
        const now = nowISO()
        return {
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
      }),
    )
  }, [])

  const addBMNote = useCallback((id, text) => {
    if (!text?.trim()) return
    const now = nowISO()
    setBMs((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        return {
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
              descricao: `Nova anotação adicionada.`,
              autor: 'admin',
              data: now,
            },
          ],
        }
      }),
    )
  }, [])

  const deleteBM = useCallback((id) => {
    setBMs((prev) => prev.filter((b) => b.id !== id))
    setProfiles((prev) =>
      prev.map((p) => (p.bmVinculada === id ? { ...p, bmVinculada: '' } : p)),
    )
  }, [])

  // ---------------- BULK ----------------
  const replaceProfiles = useCallback((rows) => setProfiles(rows), [])
  const replaceBMs = useCallback((rows) => setBMs(rows), [])

  const resetData = useCallback(() => {
    const fresh = buildMockData()
    setProfiles(fresh.profiles)
    setBMs(fresh.bms)
  }, [])

  const value = useMemo(
    () => ({
      profiles,
      bms,
      createProfile,
      updateProfile,
      moveProfileStatus,
      addProfileNote,
      deleteProfile,
      createBM,
      updateBM,
      moveBMStatus,
      addBMNote,
      deleteBM,
      replaceProfiles,
      replaceBMs,
      resetData,
    }),
    [
      profiles,
      bms,
      createProfile,
      updateProfile,
      moveProfileStatus,
      addProfileNote,
      deleteProfile,
      createBM,
      updateBM,
      moveBMStatus,
      addBMNote,
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
