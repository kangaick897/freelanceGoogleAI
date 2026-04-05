import { useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { X, CheckCircle2, Plus } from 'lucide-react';

export function Dashboard() {
  const { tasks, categories, updateTaskPaidAmount } = useStore();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [monthFilter, setMonthFilter] = useState(currentMonthStr);
  
  // Modals state
  const [showPendingSheet, setShowPendingSheet] = useState(false);
  const [showCollectSheet, setShowCollectSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addAmount, setAddAmount] = useState('');

  // Generate available months from tasks
  const monthsSet = new Set([currentMonthStr, ...tasks.map(t => {
    const d = new Date(t.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })]);
  const availableMonths = Array.from(monthsSet).sort().reverse();

  // Calculations
  const filteredTasks = monthFilter === 'all' 
    ? tasks
    : tasks.filter(t => {
        const d = new Date(t.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthFilter;
      });

  // Collect: Sum of all paidAmount (filtered by time)
  const collectedTasks = filteredTasks.filter(t => t.paidAmount > 0);
  const totalCollected = collectedTasks.reduce((sum, task) => sum + task.paidAmount, 0);

  // Pending: All-time pending (price - paidAmount > 0)
  const pendingTasks = tasks.filter(t => (t.price - t.paidAmount) > 0);
  const totalPending = pendingTasks.reduce((sum, task) => sum + (task.price - task.paidAmount), 0);

  // Donut Chart Data (by Category based on collected amount)
  const categoryData = categories.map(cat => {
    const value = collectedTasks
      .filter(t => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.paidAmount, 0);
    
    const colorMap: Record<string, string> = {
      'bg-pink-500': '#ec4899',
      'bg-purple-500': '#8b5cf6',
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981',
      'bg-orange-500': '#f97316',
    };
    
    return {
      name: cat.name,
      value,
      color: colorMap[cat.color] || '#94a3b8'
    };
  }).filter(d => d.value > 0);

  // Bar Chart Data (Trend based on Deadline)
  const barChartDataMap = new Map<string, { name: string; collected: number; pending: number; sortKey: number }>();

  tasks.forEach(task => {
    const date = new Date(task.deadline);
    
    // If filtering by a specific month, only include tasks with deadline in that month
    const taskMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthFilter !== 'all' && taskMonthStr !== monthFilter) return;

    let key = '';
    let name = '';
    let sortKey = 0;

    if (monthFilter !== 'all') {
      // Group by Week of the month
      const weekNum = Math.ceil(date.getDate() / 7);
      key = `W${weekNum}`;
      name = `Week ${weekNum}`;
      sortKey = weekNum;
    } else {
      // Group by Month
      key = `${date.getFullYear()}-${date.getMonth()}`;
      name = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // e.g. "Apr 26"
      sortKey = date.getTime();
    }

    if (!barChartDataMap.has(key)) {
      barChartDataMap.set(key, { name, collected: 0, pending: 0, sortKey });
    }

    const data = barChartDataMap.get(key)!;
    data.collected += task.paidAmount;
    data.pending += Math.max(0, task.price - task.paidAmount);
  });

  const barChartData = Array.from(barChartDataMap.values()).sort((a, b) => a.sortKey - b.sortKey);

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    const amountToAdd = Number(addAmount);
    if (amountToAdd > 0) {
      const newPaidAmount = Math.min(selectedTask.paidAmount + amountToAdd, selectedTask.price);
      updateTaskPaidAmount(selectedTask.id, newPaidAmount);
    }
    
    setSelectedTask(null);
    setAddAmount('');
  };

  const handleMarkFullyPaid = () => {
    if (!selectedTask) return;
    updateTaskPaidAmount(selectedTask.id, selectedTask.price);
    setSelectedTask(null);
    setAddAmount('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <select 
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="glass px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 outline-none"
        >
          <option value="all">All Time</option>
          {availableMonths.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(Number(year), Number(month) - 1);
            return (
              <option key={m} value={m}>
                {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </option>
            );
          })}
        </select>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowCollectSheet(true)}
          className="glass rounded-3xl p-5 text-left active:scale-95 transition-transform"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Collected</p>
          <p className="text-2xl font-bold text-green-500">฿{totalCollected.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Tap to view</p>
        </button>
        <button 
          onClick={() => setShowPendingSheet(true)}
          className="glass rounded-3xl p-5 text-left active:scale-95 transition-transform"
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Pending (All)</p>
          <p className="text-2xl font-bold text-orange-500">฿{totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Tap to view</p>
        </button>
      </div>

      {/* Charts */}
      <div className="glass rounded-3xl p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Revenue</h2>
          <div className="flex bg-white/50 rounded-lg p-1">
            <button 
              onClick={() => setChartType('donut')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartType === 'donut' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Category
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartType === 'bar' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Trend
            </button>
          </div>
        </div>

        <div className="h-48 w-full">
          {chartType === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `฿${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(value) => `฿${value >= 1000 ? (value / 1000) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value: number) => `฿${value.toLocaleString()}`}
                />
                <Bar dataKey="collected" name="Collected" stackId="a" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {chartType === 'donut' && (
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {categoryData.map((d, i) => (
              <div key={i} className="flex items-center text-xs font-medium text-slate-600">
                <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet: Pending */}
      <AnimatePresence>
        {showPendingSheet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPendingSheet(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur-xl rounded-t-3xl z-[60] p-6 min-h-[50vh] max-h-[85vh] overflow-y-auto shadow-2xl pb-24"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Pending Payments</h2>
                <button onClick={() => setShowPendingSheet(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                  <X size={20} />
                </button>
              </div>
              
              {pendingTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No pending payments. Great job! 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <button 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="w-full text-left bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
                    >
                      <div>
                        <h3 className="font-bold text-slate-800">{task.clientName}</h3>
                        <p className="text-xs text-slate-500">{task.taskName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-500">
                          ฿{(task.price - task.paidAmount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">Tap to update</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Sheet: Collected */}
      <AnimatePresence>
        {showCollectSheet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCollectSheet(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur-xl rounded-t-3xl z-[60] p-6 min-h-[50vh] max-h-[85vh] overflow-y-auto shadow-2xl pb-24"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Collected</h2>
                <button onClick={() => setShowCollectSheet(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                  <X size={20} />
                </button>
              </div>
              
              {collectedTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No collections yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {collectedTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-800">{task.clientName}</h3>
                        <p className="text-xs text-slate-500">{task.taskName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-500">
                          ฿{task.paidAmount.toLocaleString()}
                        </p>
                        {task.paidAmount < task.price && (
                          <p className="text-[10px] text-orange-400">Partial payment</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Update Payment Modal */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
              onClick={() => setSelectedTask(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
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

                <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Total Price:</span>
                    <span className="font-bold text-slate-800">฿{selectedTask.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Paid:</span>
                    <span className="font-bold text-green-500">฿{selectedTask.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                    <span className="text-slate-700 font-medium">Pending:</span>
                    <span className="font-bold text-orange-500">฿{(selectedTask.price - selectedTask.paidAmount).toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleUpdatePayment} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Add Payment Amount (฿)</label>
                    <input 
                      type="number" 
                      min="1"
                      max={selectedTask.price - selectedTask.paidAmount}
                      value={addAmount}
                      onChange={e => setAddAmount(e.target.value)}
                      placeholder={`Max: ${(selectedTask.price - selectedTask.paidAmount).toLocaleString()}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={handleMarkFullyPaid}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Fully Paid
                    </button>
                    <button 
                      type="submit"
                      disabled={!addAmount}
                      className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
