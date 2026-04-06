import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, CheckCircle2, Plus } from 'lucide-react';
import { useStore, Task } from '@/store/useStore';
import { createPortal } from 'react-dom';

export function PendingPage({ onBack }: { onBack: () => void }) {
  const { tasks, addPaymentToTask } = useStore();
  const pendingTasks = tasks.filter(t => (t.price - t.paidAmount) > 0);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addAmount, setAddAmount] = useState('');

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    const amountToAdd = Number(addAmount);
    if (amountToAdd > 0) {
      addPaymentToTask(selectedTask.id, amountToAdd);
    }
    setSelectedTask(null);
    setAddAmount('');
  };

  const handleMarkFullyPaid = () => {
    if (!selectedTask) return;
    addPaymentToTask(selectedTask.id, selectedTask.price - selectedTask.paidAmount);
    setSelectedTask(null);
    setAddAmount('');
  };

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
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Pending Payments</h1>

        {pendingTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-3xl shadow-sm border border-slate-100">No pending payments. Great job! 🎉</div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="w-full text-left bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
              >
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{task.clientName}</h3>
                  <p className="text-sm text-slate-500">{task.taskName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">฿{(task.price - task.paidAmount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">Tap to update</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Update Payment Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => setSelectedTask(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Update Payment</h3>
                    <p className="text-sm text-slate-500">{selectedTask.clientName} - {selectedTask.taskName}</p>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Total Price:</span>
                    <span className="font-bold text-slate-800">฿{selectedTask.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Paid:</span>
                    <span className="font-bold text-green-500">฿{selectedTask.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-slate-200 mt-3">
                    <span className="text-slate-700 font-medium">Pending:</span>
                    <span className="font-bold text-orange-500">฿{(selectedTask.price - selectedTask.paidAmount).toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleUpdatePayment} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Add Payment Amount (฿)</label>
                    <input
                      type="number" min="1" max={selectedTask.price - selectedTask.paidAmount}
                      value={addAmount} onChange={e => setAddAmount(e.target.value)}
                      placeholder={`Max: ${(selectedTask.price - selectedTask.paidAmount).toLocaleString()}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={handleMarkFullyPaid}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Fully Paid
                    </button>
                    <button type="submit" disabled={!addAmount}
                      className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/30">
                      <Plus size={18} /> Add
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
