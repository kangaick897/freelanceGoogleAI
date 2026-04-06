import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, addMonths, subMonths, isToday
} from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle2, PlayCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function Home() {
  const { user, tasks } = useStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const upcomingCount = tasks.filter(t => t.status === 'UPCOMING').length;
  const progressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const successCount = tasks.filter(t => t.status === 'SUCCESS').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Tasks for selected date
  const selectedDateTasks = selectedDate
    ? tasks.filter(t => isSameDay(new Date(t.deadline), selectedDate))
    : [];

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
          className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-white object-cover"
        />
      </div>

      {/* Mini-Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <CalendarIcon className="text-blue-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800"><AnimatedNumber value={upcomingCount} /></span>
          <span className="text-xs text-slate-500 font-medium">Upcoming</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Clock className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800"><AnimatedNumber value={progressCount} /></span>
          <span className="text-xs text-slate-500 font-medium">Progress</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="text-green-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-slate-800"><AnimatedNumber value={successCount} /></span>
          <span className="text-xs text-slate-500 font-medium">Success</span>
        </div>
      </div>

      {/* Interactive Monthly Calendar */}
      <div className="glass rounded-3xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1.5 bg-white/50 rounded-full text-slate-600 hover:bg-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1.5 bg-white/50 rounded-full text-slate-600 hover:bg-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            // Check if there are tasks on this day
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.deadline), day));
            const hasTasks = dayTasks.length > 0;
            const hasInProgress = dayTasks.some(t => t.status === 'IN_PROGRESS');
            const allSuccess = hasTasks && dayTasks.every(t => t.status === 'SUCCESS');

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                  ${isSelected ? 'bg-primary text-white shadow-md scale-105 z-10' : 'hover:bg-white/60'}
                  ${isTodayDate && !isSelected ? 'border-2 border-primary text-primary' : ''}
                `}
              >
                <span>{format(day, 'd')}</span>

                {/* Task Indicators */}
                {hasTasks && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' :
                        allSuccess ? 'bg-green-500' :
                          hasInProgress ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Tasks for {format(selectedDate, 'dd MMM yyyy')}
              </h2>
              {isToday(selectedDate) && (
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">Today</span>
              )}
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center text-slate-500">
                No tasks due on this day! 🏖️
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map(task => (
                  <div key={task.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.status === 'SUCCESS' ? 'bg-green-100 text-green-500' :
                        task.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-500' :
                          'bg-blue-100 text-blue-500'
                      }`}>
                      {task.status === 'SUCCESS' ? <CheckCircle2 size={20} /> :
                        task.status === 'IN_PROGRESS' ? <PlayCircle size={20} /> :
                          <CalendarIcon size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{task.taskName}</h3>
                      <p className="text-sm text-slate-500 truncate">{task.clientName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${task.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                          task.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {task.status === 'SUCCESS' ? 'Done' :
                          task.status === 'IN_PROGRESS' ? 'Doing' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
