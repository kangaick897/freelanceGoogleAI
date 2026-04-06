import { useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { CollectedPage } from './CollectedPage';
import { PendingPage } from './PendingPage';

export function Dashboard() {
  const { tasks, categories, updateTaskPaidAmount } = useStore();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [monthFilter, setMonthFilter] = useState(currentMonthStr);

  const [view, setView] = useState<'main' | 'collected' | 'pending'>('main');

  // สร้างรายการเดือนที่มีงาน
  const monthsSet = new Set([currentMonthStr, ...tasks.map(t => {
    const d = new Date(t.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })]);
  const availableMonths = Array.from(monthsSet).sort().reverse();

  // กรองงานตามเดือน
  const filteredTasks = monthFilter === 'all'
    ? tasks
    : tasks.filter(t => {
        const d = new Date(t.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthFilter;
      });

  const collectedTasks = filteredTasks.filter(t => t.paidAmount > 0);
  const totalCollected = collectedTasks.reduce((sum, t) => sum + t.paidAmount, 0);

  const pendingTasks = tasks.filter(t => (t.price - t.paidAmount) > 0);
  const totalPending = pendingTasks.reduce((sum, t) => sum + (t.price - t.paidAmount), 0);

  // ข้อมูล Donut Chart (แยกตาม Category)
  const colorMap: Record<string, string> = {
    'bg-pink-500': '#ec4899',
    'bg-purple-500': '#8b5cf6',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
    'bg-orange-500': '#f97316',
  };
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: collectedTasks.filter(t => t.categoryId === cat.id).reduce((sum, t) => sum + t.paidAmount, 0),
    color: colorMap[cat.color] || '#94a3b8',
  })).filter(d => d.value > 0);

  // ข้อมูล Bar Chart (แนวโน้มรายสัปดาห์/เดือน)
  const barChartDataMap = new Map<string, { name: string; collected: number; pending: number; sortKey: number }>();
  tasks.forEach(task => {
    const date = new Date(task.deadline);
    const taskMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthFilter !== 'all' && taskMonthStr !== monthFilter) return;

    let key, name, sortKey;
    if (monthFilter !== 'all') {
      const weekNum = Math.ceil(date.getDate() / 7);
      key = `W${weekNum}`; name = `Week ${weekNum}`; sortKey = weekNum;
    } else {
      key = `${date.getFullYear()}-${date.getMonth()}`;
      name = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      sortKey = date.getTime();
    }
    if (!barChartDataMap.has(key)) barChartDataMap.set(key, { name, collected: 0, pending: 0, sortKey });
    const data = barChartDataMap.get(key)!;
    data.collected += task.paidAmount;
    data.pending += Math.max(0, task.price - task.paidAmount);
  });
  const barChartData = Array.from(barChartDataMap.values()).sort((a, b) => a.sortKey - b.sortKey);

  if (view === 'collected') {
    return <CollectedPage onBack={() => setView('main')} />;
  }
  
  if (view === 'pending') {
    return <PendingPage onBack={() => setView('main')} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <select
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="glass px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 outline-none"
        >
          <option value="all">All Time</option>
          {availableMonths.map(m => {
            const [year, month] = m.split('-');
            return (
              <option key={m} value={m}>
                {new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </option>
            );
          })}
        </select>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setView('collected')} className="glass rounded-3xl p-5 text-left active:scale-95 transition-transform">
          <p className="text-sm font-medium text-slate-500 mb-1">Collected</p>
          <p className="text-2xl font-bold text-green-500">฿{totalCollected.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Tap to view</p>
        </button>
        <button onClick={() => setView('pending')} className="glass rounded-3xl p-5 text-left active:scale-95 transition-transform">
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
            <button onClick={() => setChartType('donut')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartType === 'donut' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Category</button>
            <button onClick={() => setChartType('bar')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartType === 'bar' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Trend</button>
          </div>
        </div>

        <div className="h-48 w-full">
          {chartType === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `฿${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(value: number) => `฿${value.toLocaleString()}`} />
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

      {/* The BottomSheets and Modals have been replaced by Full Pages */}
    </motion.div>
  );
}
