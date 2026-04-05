import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function Add() {
  const { categories, addTask } = useStore();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    taskName: '',
    deadline: '',
    price: '',
    hasDeposit: false,
    deposit: '',
    categoryId: categories[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: formData.clientName,
      taskName: formData.taskName,
      deadline: new Date(formData.deadline).toISOString(),
      price: Number(formData.price),
      deposit: formData.hasDeposit ? Number(formData.deposit) : 0,
      status: 'UPCOMING' as const,
      categoryId: formData.categoryId,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        clientName: '',
        taskName: '',
        deadline: '',
        price: '',
        hasDeposit: false,
        deposit: '',
        categoryId: categories[0]?.id || '',
      });
    }, 2000);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] text-center"
      >
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">บันทึกคิวงานสำเร็จ!</h2>
        <p className="text-slate-500">ระบบได้เพิ่มงานลงในคิวเรียบร้อยแล้ว</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6"
    >
      <h1 className="text-2xl font-bold text-slate-800">New Task</h1>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-5">
        
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">ชื่อลูกค้า</label>
          <input 
            required
            type="text" 
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="เช่น คุณเอ, บริษัท B"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">ชื่องาน</label>
          <input 
            required
            type="text" 
            value={formData.taskName}
            onChange={e => setFormData({...formData, taskName: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="เช่น ออกแบบโลโก้"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">หมวดหมู่งาน</label>
          <select 
            value={formData.categoryId}
            onChange={e => setFormData({...formData, categoryId: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">กำหนดส่ง (Deadline)</label>
          <input 
            required
            type="date" 
            value={formData.deadline}
            onChange={e => setFormData({...formData, deadline: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">ราคาตกลง (บาท)</label>
          <input 
            required
            type="number" 
            min="0"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="0"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                checked={formData.hasDeposit}
                onChange={e => setFormData({...formData, hasDeposit: e.target.checked})}
                className="peer sr-only"
              />
              <div className="w-6 h-6 bg-white/50 border border-slate-300 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white opacity-0 peer-checked:opacity-100" />
              </div>
            </div>
            <span className="text-sm font-bold text-slate-700">มีการรับมัดจำ</span>
          </label>
        </div>

        {formData.hasDeposit && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5"
          >
            <label className="text-sm font-bold text-slate-700">ยอดมัดจำ (บาท)</label>
            <input 
              required={formData.hasDeposit}
              type="number" 
              min="0"
              value={formData.deposit}
              onChange={e => setFormData({...formData, deposit: e.target.value})}
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="0"
            />
          </motion.div>
        )}

        <button 
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all mt-4"
        >
          บันทึกคิวงาน
        </button>
      </form>
    </motion.div>
  );
}
