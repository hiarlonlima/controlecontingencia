import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { TONE_STYLES } from '../utils/constants.js'

export default function KanbanBoard({
  columns, // [{ id, label, tone, items }]
  renderCard, // (item, { isDragging })
  onMove, // (itemId, fromCol, toCol) => void
  compact = false,
}) {
  function handleDragEnd(result) {
    const { draggableId, source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return
    onMove?.(draggableId, source.droppableId, destination.droppableId)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-220px)] min-h-[480px] gap-3 overflow-x-auto pb-2">
        {columns.map((col) => {
          const tone = TONE_STYLES[col.tone] ?? TONE_STYLES.slate
          return (
            <div key={col.id} className="kanban-col">
              <header className="flex items-center justify-between border-b border-ink-700/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                  <h3 className="text-sm font-semibold text-slate-200">{col.label}</h3>
                  <span className="rounded-md bg-ink-800/80 px-1.5 py-0.5 text-[11px] font-medium text-slate-400 tabular-nums">
                    {col.items.length}
                  </span>
                </div>
              </header>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 overflow-y-auto p-2.5 transition ${
                      snapshot.isDraggingOver ? 'bg-neon-500/5' : ''
                    }`}
                  >
                    {col.items.length === 0 && !snapshot.isDraggingOver && (
                      <div className="rounded-lg border border-dashed border-ink-700/60 px-3 py-6 text-center text-[11px] text-slate-500">
                        Solte um card aqui
                      </div>
                    )}
                    {col.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            style={prov.draggableProps.style}
                          >
                            {renderCard(item, { isDragging: snap.isDragging, compact })}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
