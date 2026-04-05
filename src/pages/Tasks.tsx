import { useStore, TaskStatus } from '@/store/useStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Rocket, CheckCircle2, Calendar } from 'lucide-react';

export function Tasks() {
  const { tasks, updateTaskStatus } = useStore();
  
  // Show only incomplete tasks and sort them
  const activeTasks = tasks
    .filter(t => t.status !== 'SUCCESS')
    .sort((a, b) => {
      // 1. IN_PROGRESS tasks come first
      if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
      if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
      
      // 2. Then sort by deadline (closest first)
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

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

      <div className="space-y-3">
        {activeTasks.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">All caught up!</h3>
            <p className="text-sm text-slate-500">You have no pending tasks.</p>
          </div>
        ) : (
          activeTasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass rounded-2xl p-4 relative overflow-hidden border-l-4 ${
                task.status === 'IN_PROGRESS' ? 'border-l-orange-500' : 'border-l-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{task.taskName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{task.clientName}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-md ${
                    task.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Calendar size={10} className="mr-1" />
                    {format(new Date(task.deadline), 'dd MMM')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Total / Paid</p>
                  <p className="text-xs font-bold text-slate-800">
                    ฿{task.price.toLocaleString()} <span className="text-slate-400 font-normal">/ ฿{task.paidAmount.toLocaleString()}</span>
                  </p>
                </div>

                {task.status === 'UPCOMING' ? (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                    className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95"
                  >
                    <Rocket size={14} />
                    เริ่มงาน
                  </button>
                ) : (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'SUCCESS')}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm shadow-green-500/20 active:scale-95"
                  >
                    <CheckCircle2 size={14} />
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
