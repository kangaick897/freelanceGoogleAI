import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';

export type TaskStatus = 'UPCOMING' | 'IN_PROGRESS' | 'SUCCESS';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  clientName: string;
  taskName: string;
  deadline: string; // ISO string
  price: number;
  deposit: number;
  status: TaskStatus;
  categoryId: string;
  createdAt: string;
}

export type ThemeColor = 'blue' | 'pink' | 'green' | 'purple' | 'orange';

interface AppState {
  session: Session | null;
  setSession: (session: Session | null) => void;

  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  
  user: {
    id?: string;
    email?: string;
    name: string;
    avatarUrl: string;
  };
  setUser: (user: Partial<AppState['user']>) => void;

  categories: Category[];
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;

  tasks: Task[];
  addTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Design', color: 'bg-pink-500' },
  { id: '2', name: 'Video Edit', color: 'bg-purple-500' },
  { id: '3', name: 'Coding', color: 'bg-blue-500' },
];

const mockTasks: Task[] = [
  {
    id: '1',
    clientName: 'คุณเอ',
    taskName: 'ออกแบบโลโก้ร้านกาแฟ',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    price: 5000,
    deposit: 2500,
    status: 'UPCOMING',
    categoryId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    clientName: 'คุณบี',
    taskName: 'ตัดต่อคลิป Vlog',
    deadline: new Date(Date.now() + 86400000 * 1).toISOString(), // +1 day
    price: 8000,
    deposit: 4000,
    status: 'IN_PROGRESS',
    categoryId: '2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    clientName: 'บริษัท C',
    taskName: 'ทำเว็บ Landing Page',
    deadline: new Date(Date.now() - 86400000 * 1).toISOString(), // -1 day
    price: 15000,
    deposit: 15000,
    status: 'SUCCESS',
    categoryId: '3',
    createdAt: new Date().toISOString(),
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),

      theme: 'blue',
      setTheme: (theme) => set({ theme }),
      
      user: {
        name: 'Freelancer',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
      },
      setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),

      categories: defaultCategories,
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      removeCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),

      tasks: mockTasks,
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTaskStatus: (id, status) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
      })),
    }),
    {
      name: 'freelance-storage',
      partialize: (state) => ({ theme: state.theme, user: state.user }), // Only persist theme and user preferences locally
    }
  )
);

