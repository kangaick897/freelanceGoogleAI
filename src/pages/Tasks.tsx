import { useState } from 'react';
import { useStore, Task, TaskStatus } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Rocket, CheckCircle2, Calendar, X, MessageCircle, FileText } from 'lucide-react';

const CHANNEL_EMOJI: Record<string, string> = {
  FB: '💬',
  IG: '📷',
  LINE: '🟢',
  GMAIL: '📧',
};

function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const remaining = task.price - task.paidAmount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`p-5 pb-4 border-l-4 ${task.status === 'IN_PROGRESS' ? 'border-l-orange-500' : task.status === 'SUCCESS' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <h2 className="text-lg font-bold text-slate-800 leading-tight truncate">{task.taskName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm text-slate-500">{task.clientName}</span>
                {task.contactChannel && (
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    {CHANNEL_EMOJI[task.contactChannel] ?? ''} {task.contactChannel}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Task Details */}
          {task.taskDetails && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FileText size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 mb-1">รายละเอียดงาน</p>
                <p className="text-sm text-slate-700 leading-relaxed break-words max-h-24 overflow-y-auto">{task.taskDetails}</p>
              </div>
            </div>
          )}

          {/* Deadline */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
              <Calendar size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">กำหนดส่ง</p>
              <p className="text-sm font-bold text-slate-700">{format(new Date(task.deadline), 'dd MMM yyyy')}</p>
            </div>
          </div>

          {/* Contact Channel (if no details section shown above) */}
          {task.contactChannel && !task.taskDetails && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MessageCircle size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">ช่องทางติดต่อ</p>
                <p className="text-sm font-bold text-slate-700">{CHANNEL_EMOJI[task.contactChannel] ?? ''} {task.contactChannel}</p>
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400">ราคาตกลง</span>
              <span className="text-sm font-bold text-slate-800">฿{task.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400">ชำระแล้ว</span>
              <span className="text-sm font-bold text-green-600">฿{task.paidAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">คงเหลือ</span>
              <span className={`text-sm font-bold ${remaining > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                ฿{remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${
              task.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
              task.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {task.status === 'SUCCESS' ? '✅ Done' : task.status === 'IN_PROGRESS' ? '🔥 In Progress' : '📅 Upcoming'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Tasks() {
  const { tasks, updateTaskStatus } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const activeTasks = tasks
    .filter(t => t.status !== 'SUCCESS')
    .sort((a, b) => {
      if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
      if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
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
              {/* Clickable area for the detail modal */}
              <button
                onClick={() => setSelectedTask(task)}
                className="w-full text-left mb-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{task.taskName}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-slate-500">{task.clientName}</p>
                      {task.contactChannel && (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {CHANNEL_EMOJI[task.contactChannel] ?? ''} {task.contactChannel}
                        </span>
                      )}
                    </div>
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
              </button>

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

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
