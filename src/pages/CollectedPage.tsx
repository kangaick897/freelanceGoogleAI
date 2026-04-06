import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function CollectedPage({ onBack }: { onBack: () => void }) {
  const { tasks, payments, categories } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter payments internally to the selected month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const paymentsThisMonth = useMemo(() => {
    return payments
      .filter(p => isWithinInterval(new Date(p.paymentDate), { start: monthStart, end: monthEnd }))
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, currentDate]);

  const totalThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  return (
    <motion.div
      initial={{ opacity: 0, x: '50%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-app overflow-y-auto pb-24"
    >
      <div className="p-5 max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center text-slate-500 mb-6 bg-white px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm font-bold">
          <ChevronLeft size={16} className="mr-1" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-8">Collected Revenue</h1>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-8 px-4">
          <button onClick={handlePrevMonth} className="p-2 bg-white rounded-full text-slate-500 shadow-sm hover:bg-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div className="text-lg font-bold text-slate-700">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} className="p-2 bg-white rounded-full text-slate-500 shadow-sm hover:bg-slate-100">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Total Display */}
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Total Income</p>
          <h2 className="text-5xl font-bold text-green-500 tracking-tight">
            <span className="text-3xl">฿</span>{totalThisMonth.toLocaleString()}
          </h2>
        </div>

        {/* Transactions List */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 mb-4 px-2">Transactions</h3>
          {paymentsThisMonth.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100">
              No income recorded for this month.
            </div>
          ) : (
            <div className="space-y-3">
              {paymentsThisMonth.map((payment) => {
                const task = tasks.find(t => t.id === payment.taskId);
                const category = categories.find(c => c.id === task?.categoryId);
                return (
                  <div key={payment.id} className="bg-white rounded-3xl p-5 flex items-center shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4 shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-base truncate">
                        {task?.clientName || 'Unknown Client'}
                      </h4>
                      <p className="text-xs text-slate-600 truncate">{task?.taskName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {category && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{category.name}</span>
                        )}
                        <p className="text-xs text-slate-400">
                          {format(new Date(payment.paymentDate), 'd MMM, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-green-500 text-lg">+฿{payment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
