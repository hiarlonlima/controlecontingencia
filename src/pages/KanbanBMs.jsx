import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Download, LayoutGrid, Maximize2, Minimize2, Upload } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { BM_STATUSES, BM_STATUS_MAP } from '../utils/constants.js'
import { downloadCSV, parseCSV, toCSV } from '../utils/csv.js'
import { getSettings } from '../utils/storage.js'
import KanbanBoard from '../components/KanbanBoard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import BMCard from '../components/BMCard.jsx'
import BMModal from '../components/BMModal.jsx'
import SearchFilter from '../components/SearchFilter.jsx'

const CSV_COLUMNS = [
  { key: 'nome', label: 'Nome' },
  { key: 'bmId', label: 'BM ID' },
  { key: 'status', label: 'Status' },
  { key: 'perfilDono', label: 'Perfil Dono' },
  {
    key: 'perfisVinculados',
    label: 'Perfis Vinculados',
    value: (r) => (r.perfisVinculados || []).join('|'),
  },
  {
    key: 'contasAnuncio',
    label: 'Contas Anuncio',
    value: (r) => JSON.stringify(r.contasAnuncio || []),
  },
  { key: 'metodoPagamento', label: 'Pagamento', value: (r) => (r.metodoPagamento ? 'sim' : 'nao') },
  { key: 'limiteDiario', label: 'Limite Diario' },
  { key: 'verificacao', label: 'Verificacao' },
  { key: 'pais', label: 'Pais' },
  { key: 'dominios', label: 'Dominios', value: (r) => (r.dominios || []).join('|') },
  { key: 'paginas', label: 'Paginas', value: (r) => (r.paginas || []).join('|') },
  { key: 'tags', label: 'Tags', value: (r) => (r.tags || []).join('|') },
  { key: 'observacoes', label: 'Observacoes' },
  { key: 'updatedAt', label: 'Atualizado em' },
]

export default function KanbanBMs() {
  const { profiles, bms, moveBMStatus, replaceBMs } = useData()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterDono, setFilterDono] = useState('all')
  const [filterPagamento, setFilterPagamento] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [selected, setSelected] = useState(null)
  const [compact, setCompact] = useState(getSettings().compactMode)

  const tagsList = useMemo(
    () => Array.from(new Set(bms.flatMap((b) => b.tags || []))),
    [bms],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bms.filter((b) => {
      if (filterDono !== 'all' && b.perfilDono !== filterDono) return false
      if (filterPagamento === 'sim' && !b.metodoPagamento) return false
      if (filterPagamento === 'nao' && b.metodoPagamento) return false
      if (filterTag !== 'all' && !(b.tags || []).includes(filterTag)) return false
      if (!q) return true
      const haystack = [
        b.nome,
        b.bmId,
        b.observacoes,
        ...(b.tags || []),
        ...(b.contasAnuncio || []).flatMap((c) => [c?.id, c?.nome]),
        ...(b.dominios || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [bms, search, filterDono, filterPagamento, filterTag])

  const columns = useMemo(
    () =>
      BM_STATUSES.map((s) => ({
        id: s.id,
        label: s.label,
        tone: s.tone,
        items: filtered.filter((b) => b.status === s.id),
      })),
    [filtered],
  )

  function handleExport() {
    const csv = toCSV(bms, CSV_COLUMNS)
    downloadCSV(`bms-${new Date().toISOString().slice(0, 10)}.csv`, csv)
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
          id: `bi_${Date.now()}_${idx}`,
          nome: row['Nome'] || '',
          bmId: row['BM ID'] || '',
          perfilDono: row['Perfil Dono'] || '',
          perfisVinculados: (row['Perfis Vinculados'] || '')
            .split('|')
            .map((x) => x.trim())
            .filter(Boolean),
          contasAnuncio: (() => {
            const raw = row['Contas Anuncio'] || ''
            if (!raw) return []
            // Tenta JSON (formato novo)
            if (raw.trim().startsWith('[')) {
              try {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                  return parsed.map((c) => ({
                    nome: c?.nome || '',
                    id: c?.id || '',
                    status: c?.status || 'preparacao',
                    tier: c?.tier || 't2',
                    observacao: c?.observacao || '',
                  }))
                }
              } catch {
                /* cai pro fallback */
              }
            }
            // Fallback: formato antigo (lista separada por |)
            return raw
              .split('|')
              .map((x) => x.trim())
              .filter(Boolean)
              .map((id) => ({
                nome: '',
                id,
                status: 'preparacao',
                tier: 't2',
                observacao: '',
              }))
          })(),
          metodoPagamento: row['Pagamento'] === 'sim',
          limiteDiario: row['Limite Diario'] || '',
          status: BM_STATUS_MAP[row['Status']]?.id || 'nova',
          verificacao: ['nao_verificada', 'em_analise', 'verificada'].includes(
            row['Verificacao'],
          )
            ? row['Verificacao']
            : 'nao_verificada',
          pais: row['Pais'] || 'Brasil',
          dominios: (row['Dominios'] || '')
            .split('|')
            .map((x) => x.trim())
            .filter(Boolean),
          paginas: (row['Paginas'] || '')
            .split('|')
            .map((x) => x.trim())
            .filter(Boolean),
          observacoes: row['Observacoes'] || '',
          tags: (row['Tags'] || '').split('|').map((t) => t.trim()).filter(Boolean),
          historico: [
            {
              id: `h_${Date.now()}_${idx}`,
              tipo: 'criado',
              descricao: 'BM importada via CSV.',
              autor: 'admin',
              data: now,
            },
          ],
          notas: [],
          createdAt: now,
          updatedAt: now,
        }))
        replaceBMs([...imported, ...bms])
        toast.success(`${imported.length} BMs importadas.`)
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
        title="Kanban de BMs"
        subtitle="Operação visual de Business Managers. Arraste para mudar de etapa."
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
            <Link to="/cadastro/bm" className="btn-primary">
              <Building2 size={14} />
              Nova BM
            </Link>
          </>
        }
      />

      <SearchFilter
        search={search}
        onSearch={setSearch}
        resultCount={filtered.length}
        totalCount={bms.length}
        filters={[
          {
            key: 'dono',
            label: 'Perfil dono',
            value: filterDono,
            onChange: setFilterDono,
            allLabel: 'Todos os donos',
            options: profiles.map((p) => ({ value: p.id, label: p.nome })),
          },
          {
            key: 'pagamento',
            label: 'Pagamento',
            value: filterPagamento,
            onChange: setFilterPagamento,
            allLabel: 'Pagamento: todos',
            options: [
              { value: 'sim', label: 'Com pagamento' },
              { value: 'nao', label: 'Sem pagamento' },
            ],
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
            {BM_STATUSES.length} colunas
          </span>
        }
      />

      <KanbanBoard
        columns={columns}
        compact={compact}
        onMove={(itemId, _from, to) => moveBMStatus(itemId, to)}
        renderCard={(item, { isDragging }) => (
          <BMCard
            bm={item}
            profiles={profiles}
            compact={compact}
            isDragging={isDragging}
            onClick={() => setSelected(item)}
          />
        )}
      />

      <BMModal open={!!selected} bm={selected} onClose={() => setSelected(null)} />
    </>
  )
}
