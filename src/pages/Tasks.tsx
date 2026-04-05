import { useStore, TaskStatus } from '@/store/useStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Rocket, CheckCircle2, Clock, Calendar } from 'lucide-react';

export function Tasks() {
  const { tasks, categories, updateTaskStatus } = useStore();
  
  // Show only incomplete tasks
  const activeTasks = tasks.filter(t => t.status !== 'SUCCESS')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const getCategoryColor = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.color : 'bg-slate-500';
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Uncategorized';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
        <div className="glass px-3 py-1 rounded-full text-sm font-medium text-primary">
          {activeTasks.length} Active
        </div>
      </div>

      <div className="space-y-4">
        {activeTasks.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">All caught up!</h3>
            <p className="text-slate-500">You have no pending tasks.</p>
          </div>
        ) : (
          activeTasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-5 relative overflow-hidden"
            >
              {/* Category Indicator Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getCategoryColor(task.categoryId)}`} />
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    {getCategoryName(task.categoryId)}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{task.taskName}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{task.clientName}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-xs font-medium text-slate-500 bg-white/50 px-2 py-1 rounded-lg">
                    <Calendar size={12} className="mr-1" />
                    {format(new Date(task.deadline), 'dd MMM')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total / Deposit</p>
                  <p className="text-sm font-bold text-slate-800">
                    ฿{task.price.toLocaleString()} <span className="text-slate-400 font-normal">/ ฿{task.deposit.toLocaleString()}</span>
                  </p>
                </div>

                {task.status === 'UPCOMING' ? (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                    className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-blue-500/20 active:scale-95"
                  >
                    <Rocket size={16} />
                    เริ่มงาน
                  </button>
                ) : (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'SUCCESS')}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-green-500/20 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    ปิดงาน
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
