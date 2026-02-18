import { useState, useEffect, useRef, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { loadTasks, saveTasks, generateId, getRamadanDates, Task } from "@/lib/storage";

interface ChallengeTableProps {
  tab: "meli" | "younes";
}

const dates = getRamadanDates();

type CellState = undefined | "done" | "missed";

const nextState = (current: CellState): CellState => {
  if (!current) return "done";
  if (current === "done") return "missed";
  return undefined;
};

export default function ChallengeTable({ tab }: ChallengeTableProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popCells, setPopCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTasks(loadTasks(tab));
  }, [tab]);

  const persist = useCallback(
    (updated: Task[]) => {
      setTasks(updated);
      saveTasks(tab, updated);
    },
    [tab]
  );

  const addTask = () => {
    const newTask: Task = {
      id: generateId(),
      name: "",
      cells: {},
      order: tasks.length,
    };
    const updated = [...tasks, newTask];
    persist(updated);
    setEditingId(newTask.id);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const updateTaskName = (id: string, name: string) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const deleteTask = (id: string) => {
    persist(tasks.filter((t) => t.id !== id));
  };

  const toggleCell = (taskId: string, dayIndex: number) => {
    const cellKey = `${taskId}-${dayIndex}`;
    setPopCells((prev) => new Set(prev).add(cellKey));
    setTimeout(() => {
      setPopCells((prev) => {
        const n = new Set(prev);
        n.delete(cellKey);
        return n;
      });
    }, 300);

    persist(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const newCells = { ...t.cells };
        const ns = nextState(newCells[dayIndex]);
        if (ns) newCells[dayIndex] = ns;
        else delete newCells[dayIndex];
        return { ...t, cells: newCells };
      })
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    persist(reordered.map((t, i) => ({ ...t, order: i })));
  };

  const accentClass = tab === "meli" ? "tab-meli" : "tab-younes";
  const accentColor = tab === "meli" ? "text-tab-meli" : "text-tab-younes";
  const accentBorder = tab === "meli" ? "border-tab-meli/30" : "border-tab-younes/30";
  const accentBg = tab === "meli" ? "bg-tab-meli-soft" : "bg-tab-younes-soft";
  const accentBtnBg = tab === "meli" ? "bg-tab-meli" : "bg-tab-younes";
  const accentBtnHover = tab === "meli" ? "hover:bg-tab-meli/80" : "hover:bg-tab-younes/80";

  const formatDay = (d: Date) => {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className={`${accentClass} w-full`}>
      <div className="overflow-x-auto scrollbar-thin rounded-lg border border-border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`sticky left-0 z-20 bg-card border-b border-r ${accentBorder} px-2 py-2 w-8`} />
              <th
                className={`sticky left-7 z-20 bg-card border-b border-r ${accentBorder} px-4 py-3 text-left min-w-[180px]`}
              >
                <span className={`font-semibold text-sm ${accentColor}`}>Task</span>
              </th>
              {dates.map((d, i) => (
                <th
                  key={i}
                  className={`border-b ${accentBorder} px-1 py-2 text-center min-w-[44px]`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      D{i + 1}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {formatDay(d)}
                    </span>
                  </div>
                </th>
              ))}
              <th className={`border-b ${accentBorder} px-2 py-2 w-10`} />
            </tr>
          </thead>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  <AnimatePresence initial={false}>
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`group ${
                              snapshot.isDragging ? "bg-secondary/80 shadow-lg" : ""
                            }`}
                          >
                            <td
                              {...provided.dragHandleProps}
                              className={`sticky left-0 z-10 bg-card border-b border-r ${accentBorder} px-2 py-1 cursor-grab active:cursor-grabbing`}
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                            </td>
                            <td
                              className={`sticky left-8 z-10 bg-card border-b border-r ${accentBorder} px-3 py-1`}
                            >
                              {editingId === task.id ? (
                                <input
                                  ref={inputRef}
                                  value={task.name}
                                  onChange={(e) =>
                                    updateTaskName(task.id, e.target.value)
                                  }
                                  onBlur={() => setEditingId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") setEditingId(null);
                                  }}
                                  placeholder="Task name..."
                                  className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-foreground outline-none text-sm py-1 text-foreground placeholder:text-muted-foreground/50"
                                  autoFocus
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingId(task.id);
                                    setTimeout(() => inputRef.current?.focus(), 50);
                                  }}
                                  className="w-full text-left text-sm py-1 text-foreground/90 hover:text-foreground transition-colors truncate"
                                >
                                  {task.name || (
                                    <span className="text-muted-foreground/40 italic">
                                      Click to name...
                                    </span>
                                  )}
                                </button>
                              )}
                            </td>
                            {dates.map((_, dayIndex) => {
                              const state = task.cells[dayIndex];
                              const cellKey = `${task.id}-${dayIndex}`;
                              const isPop = popCells.has(cellKey);
                              return (
                                <td
                                  key={dayIndex}
                                  className={`border-b ${accentBorder} p-[2px]`}
                                >
                                  <button
                                    onClick={() => toggleCell(task.id, dayIndex)}
                                    className={`w-full aspect-square rounded-sm transition-all duration-150 cursor-pointer
                                      ${
                                        state === "done"
                                          ? "cell-done"
                                          : state === "missed"
                                          ? "cell-missed"
                                          : "bg-muted/30 hover:bg-muted/60"
                                      }
                                      ${isPop ? "cell-pop" : ""}
                                      active:scale-90
                                    `}
                                    style={{ minWidth: 28, minHeight: 28 }}
                                  />
                                </td>
                              );
                            })}
                            <td className={`border-b ${accentBorder} px-1 py-1`}>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </motion.tr>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      </div>

      <button
        onClick={addTask}
        className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
          ${accentBtnBg} text-background ${accentBtnHover} transition-colors active:scale-95`}
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>
    </div>
  );
}
