import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function Dashboard() {
  const { tasks, categories } = useStore();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [monthFilter, setMonthFilter] = useState('all');

  // Calculations
  const totalCollected = tasks.reduce((sum, task) => {
    if (task.status === 'SUCCESS') return sum + task.price;
    return sum + task.deposit;
  }, 0);

  const totalPending = tasks.reduce((sum, task) => {
    if (task.status !== 'SUCCESS') return sum + (task.price - task.deposit);
    return sum;
  }, 0);

  // Donut Chart Data (by Category)
  const categoryData = categories.map(cat => {
    const value = tasks
      .filter(t => t.categoryId === cat.id)
      .reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.price : t.deposit), 0);
    
    // Extract hex color or use default based on tailwind class (simplified for recharts)
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

  // Pending List
  const pendingTasks = tasks.filter(t => t.status !== 'SUCCESS' && (t.price - t.deposit) > 0);

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
          <option value="this_month">This Month</option>
        </select>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Collected</p>
          <p className="text-2xl font-bold text-green-500">฿{totalCollected.toLocaleString()}</p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-500">฿{totalPending.toLocaleString()}</p>
        </div>
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
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Bar chart placeholder (Requires monthly data grouping)
            </div>
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

      {/* Pending List */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Payments</h2>
        {pendingTasks.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-slate-500">
            No pending payments. Great job! 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{task.clientName}</h3>
                  <p className="text-xs text-slate-500">{task.taskName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-500">
                    ฿{(task.price - task.deposit).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
