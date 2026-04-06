import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const CONTACT_CHANNELS = ['FB', 'IG', 'LINE', 'GMAIL'] as const;

export function Add() {
  const { categories, addTask } = useStore();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    contactChannel: 'FB',
    taskName: '',
    taskDetails: '',
    deadline: '',
    price: '',
    hasDeposit: false,
    paidAmount: '',
    categoryId: categories[0]?.id || '',
  });

  const createUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = {
      id: createUUID(),
      clientName: formData.clientName,
      contactChannel: formData.contactChannel,
      taskName: formData.taskName,
      taskDetails: formData.taskDetails || undefined,
      deadline: new Date(formData.deadline).toISOString(),
      price: Number(formData.price),
      paidAmount: formData.hasDeposit ? Number(formData.paidAmount) : 0,
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
        contactChannel: 'FB',
        taskName: '',
        taskDetails: '',
        deadline: '',
        price: '',
        hasDeposit: false,
        paidAmount: '',
        categoryId: categories[0]?.id || '',
      });
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6 relative"
    >
      <h1 className="text-2xl font-bold text-slate-800">New Task</h1>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-5 relative z-10">
        
        {/* Client Name */}
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

        {/* Contact Channel */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">ช่องทางการติดต่อ</label>
          <select 
            value={formData.contactChannel}
            onChange={e => setFormData({...formData, contactChannel: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
          >
            {CONTACT_CHANNELS.map(ch => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>

        {/* Task Name */}
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

        {/* Task Details */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">รายละเอียดงาน <span className="text-slate-400 font-normal">(ไม่บังคับ)</span></label>
          <textarea 
            rows={3}
            value={formData.taskDetails}
            onChange={e => setFormData({...formData, taskDetails: e.target.value})}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            placeholder="เช่น ออกแบบโลโก้ โทนสีฟ้า-ขาว พร้อมไฟล์ AI"
          />
        </div>

        {/* Category */}
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

        {/* Deadline */}
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

        {/* Price */}
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

        {/* Deposit Checkbox */}
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

        {/* Deposit Amount */}
        {formData.hasDeposit && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5"
          >
            <label className="text-sm font-bold text-slate-700">ยอดที่ชำระแล้ว (บาท)</label>
            <input 
              required={formData.hasDeposit}
              type="number" 
              min="0"
              value={formData.paidAmount}
              onChange={e => setFormData({...formData, paidAmount: e.target.value})}
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

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">บันทึกคิวงานสำเร็จ!</h2>
              <p className="text-slate-500">ระบบได้เพิ่มงานลงในคิวเรียบร้อยแล้ว</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
