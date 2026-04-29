import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, LayoutGrid, Maximize2, Minimize2, Upload, UserPlus } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import {
  CONFIDENCE_LEVELS,
  PROFILE_STATUSES,
  PROFILE_STATUS_MAP,
} from '../utils/constants.js'
import { downloadCSV, parseCSV, toCSV } from '../utils/csv.js'
import { getSettings } from '../utils/storage.js'
import KanbanBoard from '../components/KanbanBoard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import ProfileModal from '../components/ProfileModal.jsx'
import SearchFilter from '../components/SearchFilter.jsx'

const CSV_COLUMNS = [
  { key: 'nome', label: 'Nome' },
  { key: 'codigoInterno', label: 'Codigo Interno' },
  { key: 'login', label: 'Login' },
  { key: 'fornecedor', label: 'Fornecedor' },
  { key: 'status', label: 'Status' },
  { key: 'nivelConfianca', label: 'Confianca' },
  { key: 'pais', label: 'Pais' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'proxy', label: 'Proxy' },
  { key: 'bmVinculada', label: 'BM Vinculada' },
  { key: 'contaAnuncioVinculada', label: 'Conta Anuncio' },
  { key: 'tags', label: 'Tags', value: (r) => (r.tags || []).join('|') },
  { key: 'observacoes', label: 'Observacoes' },
  { key: 'dataCompra', label: 'Data Compra' },
  { key: 'updatedAt', label: 'Atualizado em' },
]

export default function KanbanProfiles() {
  const { profiles, bms, moveProfileStatus, replaceProfiles } = useData()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterFornecedor, setFilterFornecedor] = useState('all')
  const [filterConfianca, setFilterConfianca] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [selected, setSelected] = useState(null)
  const [compact, setCompact] = useState(getSettings().compactMode)

  const fornecedores = useMemo(
    () => Array.from(new Set(profiles.map((p) => p.fornecedor).filter(Boolean))),
    [profiles],
  )
  const tagsList = useMemo(
    () => Array.from(new Set(profiles.flatMap((p) => p.tags || []))),
    [profiles],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return profiles.filter((p) => {
      if (filterFornecedor !== 'all' && p.fornecedor !== filterFornecedor) return false
      if (filterConfianca !== 'all' && p.nivelConfianca !== filterConfianca) return false
      if (filterTag !== 'all' && !(p.tags || []).includes(filterTag)) return false
      if (!q) return true
      const haystack = [
        p.nome,
        p.codigoInterno,
        p.fornecedor,
        p.login,
        p.contaAnuncioVinculada,
        ...(p.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [profiles, search, filterFornecedor, filterConfianca, filterTag])

  const columns = useMemo(
    () =>
      PROFILE_STATUSES.map((s) => ({
        id: s.id,
        label: s.label,
        tone: s.tone,
        items: filtered.filter((p) => p.status === s.id),
      })),
    [filtered],
  )

  function handleExport() {
    const csv = toCSV(profiles, CSV_COLUMNS)
    downloadCSV(`perfis-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    toast.success('CSV exportado.')
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const { rows } = parseCSV(String(reader.result))
        const now = new Date().toISOString()
        const imported = rows.map((row, idx) => ({
          id: `pi_${Date.now()}_${idx}`,
          nome: row['Nome'] || '',
          codigoInterno: row['Codigo Interno'] || '',
          login: row['Login'] || '',
          senha: '',
          twoFA: '',
          fornecedor: row['Fornecedor'] || '',
          dataCompra: row['Data Compra'] || now,
          dataCriacaoFacebook: '',
          status: PROFILE_STATUS_MAP[row['Status']]?.id || 'novo',
          nivelConfianca: ['baixo', 'medio', 'alto'].includes(row['Confianca'])
            ? row['Confianca']
            : 'medio',
          pais: row['Pais'] || 'Brasil',
          proxy: row['Proxy'] || '',
          telefone: row['Telefone'] || '',
          bmVinculada: row['BM Vinculada'] || '',
          contaAnuncioVinculada: row['Conta Anuncio'] || '',
          observacoes: row['Observacoes'] || '',
          tags: (row['Tags'] || '').split('|').map((t) => t.trim()).filter(Boolean),
          historico: [
            {
              id: `h_${Date.now()}_${idx}`,
              tipo: 'criado',
              descricao: 'Perfil importado via CSV.',
              autor: 'admin',
              data: now,
            },
          ],
          notas: [],
          createdAt: now,
          updatedAt: now,
        }))
        replaceProfiles([...imported, ...profiles])
        toast.success(`${imported.length} perfis importados.`)
      } catch (err) {
        toast.error('Falha ao importar CSV.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventário"
        title="Kanban de Perfis"
        subtitle="Arraste cards entre colunas para atualizar status. Cada movimento entra no histórico."
        actions={
          <>
            <button
              className="btn-ghost"
              onClick={() => setCompact((v) => !v)}
              title="Modo compacto"
            >
              {compact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              {compact ? 'Expandido' : 'Compacto'}
            </button>
            <label className="btn-ghost cursor-pointer">
              <Upload size={14} />
              Importar CSV
              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={handleImport}
              />
            </label>
            <button className="btn-ghost" onClick={handleExport}>
              <Download size={14} />
              Exportar CSV
            </button>
            <Link to="/cadastro/perfil" className="btn-primary">
              <UserPlus size={14} />
              Novo perfil
            </Link>
          </>
        }
      />

      <SearchFilter
        search={search}
        onSearch={setSearch}
        resultCount={filtered.length}
        totalCount={profiles.length}
        filters={[
          {
            key: 'fornecedor',
            label: 'Fornecedor',
            value: filterFornecedor,
            onChange: setFilterFornecedor,
            allLabel: 'Todos os fornecedores',
            options: fornecedores.map((f) => ({ value: f, label: f })),
          },
          {
            key: 'confianca',
            label: 'Confiança',
            value: filterConfianca,
            onChange: setFilterConfianca,
            allLabel: 'Toda confiança',
            options: CONFIDENCE_LEVELS.map((c) => ({ value: c.id, label: c.label })),
          },
          {
            key: 'tag',
            label: 'Tag',
            value: filterTag,
            onChange: setFilterTag,
            allLabel: 'Todas as tags',
            options: tagsList.map((t) => ({ value: t, label: t })),
          },
        ]}
        rightSlot={
          <span className="hidden items-center gap-1 text-[11px] text-slate-500 md:inline-flex">
            <LayoutGrid size={12} />
            {PROFILE_STATUSES.length} colunas
          </span>
        }
      />

      <KanbanBoard
        columns={columns}
        compact={compact}
        onMove={(itemId, _from, to) => moveProfileStatus(itemId, to)}
        renderCard={(item, { isDragging }) => (
          <ProfileCard
            profile={item}
            bms={bms}
            compact={compact}
            isDragging={isDragging}
            onClick={() => setSelected(item)}
          />
        )}
      />

      <ProfileModal open={!!selected} profile={selected} onClose={() => setSelected(null)} />
    </>
  )
}
