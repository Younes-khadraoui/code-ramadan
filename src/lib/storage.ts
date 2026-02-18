export interface Task {
  id: string;
  name: string;
  cells: Record<number, "done" | "missed">; // day index -> state
  order: number;
}

export interface TabData {
  tasks: Task[];
}

const STORAGE_KEY = "ramadan-challenge-2026";

function getStorageKey(tab: string) {
  return `${STORAGE_KEY}-${tab}`;
}

export function loadTasks(tab: string): Task[] {
  try {
    const raw = localStorage.getItem(getStorageKey(tab));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tab: string, tasks: Task[]) {
  localStorage.setItem(getStorageKey(tab), JSON.stringify(tasks));
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Ramadan 2026 starts approximately Feb 18, 2026
export function getRamadanDates(): Date[] {
  const start = new Date(2026, 1, 18); // Feb 18, 2026
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}
