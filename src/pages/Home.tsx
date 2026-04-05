import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { Calendar, Clock, CheckCircle2, PlayCircle } from 'lucide-react';

export function Home() {
  const { user, tasks } = useStore();
  
  const upcomingCount = tasks.filter(t => t.status === 'UPCOMING').length;
  const progressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const successCount = tasks.filter(t => t.status === 'SUCCESS').length;

  const recentTasks = tasks.filter(t => t.status === 'IN_PROGRESS').slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
        </div>
        <img 
          src={user.avatarUrl} 
          alt="Profile" 
          className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-white"
        />
      </div>

      {/* Mini-Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Calendar className="text-blue-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800">{upcomingCount}</span>
          <span className="text-xs text-slate-500 font-medium">Upcoming</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Clock className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800">{progressCount}</span>
          <span className="text-xs text-slate-500 font-medium">Progress</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="text-green-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800">{successCount}</span>
          <span className="text-xs text-slate-500 font-medium">Success</span>
        </div>
      </div>

      {/* Interactive Calendar (Simplified for prototype) */}
      <div className="glass rounded-3xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Schedule</h2>
          <span className="text-sm text-primary font-medium">{format(new Date(), 'MMMM yyyy')}</span>
        </div>
        
        {/* Horizontal scroll of days */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {Array.from({ length: 14 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i - 3); // Start from 3 days ago
            const isToday = isSameDay(date, new Date());
            const hasDeadline = tasks.some(t => isSameDay(new Date(t.deadline), date) && t.status !== 'SUCCESS');

            return (
              <div 
                key={i} 
                className={`snap-center flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl relative ${isToday ? 'bg-primary text-white shadow-md' : 'bg-white/40 text-slate-600'}`}
              >
                <span className="text-xs font-medium opacity-80">{format(date, 'EEE')}</span>
                <span className="text-lg font-bold">{format(date, 'd')}</span>
                {hasDeadline && (
                  <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-red-500'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">In Progress</h2>
        {recentTasks.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-slate-500">
            No tasks in progress. Time to relax! ☕
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <PlayCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{task.taskName}</h3>
                  <p className="text-sm text-slate-500 truncate">{task.clientName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-400">Due</p>
                  <p className="text-sm font-bold text-slate-700">{format(new Date(task.deadline), 'dd MMM')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
