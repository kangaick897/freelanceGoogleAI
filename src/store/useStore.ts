import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchTasks, insertTask, patchTaskStatus, patchTaskPaidAmount, fetchPayments, insertPaymentRecord, deleteAllUserData } from '@/services/taskService';

export type TaskStatus = 'UPCOMING' | 'IN_PROGRESS' | 'SUCCESS';

export interface Payment {
  id: string;
  taskId: string;
  amount: number;
  paymentDate: string;
}

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
  payments: Payment[];
  addTask: (task: Task) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  addPaymentToTask: (taskId: string, amount: number) => Promise<void>;

  fetchData: () => Promise<void>;
  isDataLoaded: boolean;
  resetUserData: () => Promise<void>;
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

      payments: [],
      tasks: [],
      addTask: async (task) => {
        // If task has initial deposit, create a payment record for it too
        const initialPayment: Payment | null = task.paidAmount > 0 ? {
          id: crypto.randomUUID(),
          taskId: task.id,
          amount: task.paidAmount,
          paymentDate: new Date().toISOString(),
        } : null;

        set((state) => ({
          tasks: [...state.tasks, task],
          payments: initialPayment ? [...state.payments, initialPayment] : state.payments,
        }));

        const userId = get().session?.user.id;
        if (userId) await insertTask(userId, task);
        // Note: insertTask already handles inserting the payment to DB if paidAmount > 0
      },
      updateTaskStatus: async (id, status) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
        }));
        const userId = get().session?.user.id;
        if (userId) await patchTaskStatus(id, status);
      },
      addPaymentToTask: async (taskId, amount) => {
        const paymentId = crypto.randomUUID();
        const paymentDate = new Date().toISOString();
        
        // Update local state directly for fast UI
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (!task) return state;
          
          return {
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, paidAmount: t.paidAmount + amount } : t),
            payments: [...state.payments, { id: paymentId, taskId, amount, paymentDate }]
          };
        });

        const userId = get().session?.user.id;
        if (userId) {
          // 1. Insert payment record
          await insertPaymentRecord({ id: paymentId, taskId, amount, paymentDate });
          // 2. Sync task paid_amount
          const task = get().tasks.find(t => t.id === taskId);
          if (task) {
            await patchTaskPaidAmount(taskId, task.paidAmount);
          }
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
          const tasks = await fetchTasks(userId);
          set({ tasks });

          // Fetch payments
          const taskIds = tasks.map(t => t.id);
          if (taskIds.length > 0) {
            const payments = await fetchPayments(taskIds);
            set({ payments });
          }

          set({ isDataLoaded: true });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },

      resetUserData: async () => {
        const userId = get().session?.user.id;
        if (!userId) return;
        await deleteAllUserData(userId);
        set({ tasks: [], payments: [] });
      },
    }),
    {
      name: 'freelance-storage',
      partialize: (state) => ({ theme: state.theme, user: state.user }), // Only persist theme and user preferences locally
    }
  )
);

