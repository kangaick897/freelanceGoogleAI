import { Home, ListTodo, PlusCircle, PieChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'add', icon: PlusCircle, label: 'Add', isMain: true },
    { id: 'dashboard', icon: PieChart, label: 'Dash' },
    { id: 'settings', icon: Settings, label: 'Set' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 z-50 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-panel rounded-3xl flex items-center justify-between px-2 py-2 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            if (tab.isMain) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                >
                  <Icon size={28} strokeWidth={2.5} />
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all relative",
                  isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={22} className="relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1 relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
