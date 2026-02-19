import supabase from './supabase';

export interface Task {
  id: string;
  name: string;
  cells: Record<number, "done" | "missed">; // day index -> state
  order: number;
  tab: string;
  created_at: string;
}

export interface TabData {
  tasks: Task[];
}

const TASKS_TABLE = 'tasks';

export async function loadTasks(tab: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from(TASKS_TABLE)
      .select()
      .eq('tab', tab)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error loading tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in loadTasks:', error);
    return [];
  }
}

export async function saveTasks(tab: string, tasks: Task[]): Promise<boolean> {
  try {
    // Delete existing tasks for this tab
    const { error: deleteError } = await supabase
      .from(TASKS_TABLE)
      .delete()
      .eq('tab', tab);

    if (deleteError) {
      console.error('Error deleting old tasks:', deleteError);
      return false;
    }

    // Insert new tasks
    const { error: insertError } = await supabase
      .from(TASKS_TABLE)
      .insert(
        tasks.map((task) => ({
          ...task,
          tab,
          cells: JSON.stringify(task.cells),
        }))
      );

    if (insertError) {
      console.error('Error saving tasks:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveTasks:', error);
    return false;
  }
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
