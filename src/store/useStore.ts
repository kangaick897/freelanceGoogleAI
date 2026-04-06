import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type TaskStatus = 'UPCOMING' | 'IN_PROGRESS' | 'SUCCESS';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  clientName: string;
  contactChannel?: string;
  taskName: string;
  taskDetails?: string;
  deadline: string; // ISO string
  price: number;
  paidAmount: number;
  status: TaskStatus;
  categoryId: string;
  createdAt: string;
}

export type ThemeColor = 'blue' | 'pink' | 'green' | 'purple' | 'orange';

interface AppState {
  session: Session | null;
  setSession: (session: Session | null) => void;

  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => Promise<void>;
  
  user: {
    id?: string;
    email?: string;
    name: string;
    avatarUrl: string;
  };
  setUser: (user: Partial<AppState['user']>) => Promise<void>;

  categories: Category[];
  addCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;

  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskPaidAmount: (id: string, paidAmount: number) => Promise<void>;

  fetchData: () => Promise<void>;
  isDataLoaded: boolean;
}

const defaultCategories: Category[] = [
  { id: '11111111-1111-4111-a111-111111111111', name: 'Design', color: 'bg-pink-500' },
  { id: '22222222-2222-4222-a222-222222222222', name: 'Video Edit', color: 'bg-purple-500' },
  { id: '33333333-3333-4333-a333-333333333333', name: 'Coding', color: 'bg-blue-500' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => set({ session }),

      theme: 'blue',
      setTheme: async (theme) => {
        set({ theme });
        const userId = get().session?.user.id;
        if (userId) {
          await supabase.from('users').update({ theme_color: theme }).eq('id', userId);
        }
      },
      
      user: {
        name: 'Freelancer',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
      },
      setUser: async (userUpdate) => {
        set((state) => ({ user: { ...state.user, ...userUpdate } }));
        const userId = get().session?.user.id;
        if (userId && (userUpdate.name || userUpdate.avatarUrl)) {
          const currentUser = get().user;
          await supabase.from('users').upsert({ 
            id: userId, 
            full_name: currentUser.name, 
            avatar_url: currentUser.avatarUrl 
          });
        }
      },

      categories: [],
      addCategory: async (category) => {
        set((state) => ({ categories: [...state.categories, category] }));
        const userId = get().session?.user.id;
        if (userId) {
          const { error } = await supabase.from('categories').insert({
            id: category.id,
            user_id: userId,
            name: category.name,
            color: category.color
          });
          if (error) console.error('Error inserting category:', error);
        }
      },
      removeCategory: async (id) => {
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
        const userId = get().session?.user.id;
        if (userId) {
          await supabase.from('categories').delete().eq('id', id);
        }
      },

      tasks: [],
      addTask: async (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        const userId = get().session?.user.id;
        if (userId) {
          const { error } = await supabase.from('tasks').insert({
            id: task.id,
            user_id: userId,
            task_name: task.taskName,
            client_name: task.clientName,
            contact_channel: task.contactChannel ?? null,
            task_details: task.taskDetails ?? null,
            deadline: task.deadline,
            price: task.price,
            paid_amount: task.paidAmount,
            status: task.status,
            category_id: task.categoryId,
            created_at: task.createdAt
          });
          if (error) console.error('Error inserting task:', error);
        }
      },
      updateTaskStatus: async (id, status) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
        }));
        const userId = get().session?.user.id;
        if (userId) {
          await supabase.from('tasks').update({ status }).eq('id', id);
        }
      },
      updateTaskPaidAmount: async (id, paidAmount) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, paidAmount } : t)
        }));
        const userId = get().session?.user.id;
        if (userId) {
          await supabase.from('tasks').update({ paid_amount: paidAmount }).eq('id', id);
        }
      },

      isDataLoaded: false,
      fetchData: async () => {
        const userId = get().session?.user.id;
        if (!userId) return;

        try {
          // Fetch user profile
          const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
          if (userData) {
            set((state) => ({
              user: { ...state.user, name: userData.full_name, avatarUrl: userData.avatar_url },
              theme: userData.theme_color as ThemeColor
            }));
          } else {
            // Create default user profile if not exists
            const defaultUser = get().user;
            await supabase.from('users').insert({
              id: userId,
              full_name: defaultUser.name,
              avatar_url: defaultUser.avatarUrl,
              theme_color: get().theme
            });
          }

          // Fetch categories
          const { data: categoriesData } = await supabase.from('categories').select('*').eq('user_id', userId);
          if (categoriesData && categoriesData.length > 0) {
            set({ categories: categoriesData.map(c => ({ id: c.id, name: c.name, color: c.color })) });
          } else {
            // Insert default categories if none exist
            const defaults = defaultCategories;
            set({ categories: defaults });
            try {
              const { error: catErr } = await supabase.from('categories').insert(
                defaults.map(c => ({ id: c.id, user_id: userId, name: c.name, color: c.color }))
              );
              if (catErr) console.error('Error inserting default categories:', catErr);
            } catch (err) {
               console.error('Exception inserting default categories:', err);
            }
          }

          // Fetch tasks
          const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', userId);
          if (tasksData) {
            set({
              tasks: tasksData.map(t => ({
                id: t.id,
                taskName: t.task_name,
                clientName: t.client_name,
                contactChannel: t.contact_channel ?? undefined,
                taskDetails: t.task_details ?? undefined,
                deadline: t.deadline,
                price: Number(t.price),
                paidAmount: Number(t.paid_amount),
                status: t.status as TaskStatus,
                categoryId: t.category_id,
                createdAt: t.created_at
              }))
            });
          }

          set({ isDataLoaded: true });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }),
    {
      name: 'freelance-storage',
      partialize: (state) => ({ theme: state.theme, user: state.user }), // Only persist theme and user preferences locally
    }
  )
);

