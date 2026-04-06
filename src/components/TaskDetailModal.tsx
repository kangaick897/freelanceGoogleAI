import { Task } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Calendar, FileText, MessageCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

const CHANNEL_EMOJI: Record<string, string> = {
  FB: '💬',
  IG: '📷',
  LINE: '🟢',
  GMAIL: '📧',
};

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

// Modal แสดงรายละเอียดงานแบบเต็ม กดพื้นที่นอกหรือปุ่ม X เพื่อปิด
export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  if (typeof document === 'undefined') return null;

  const remaining = task ? task.price - task.paidAmount : 0;
  const borderColor =
    task?.status === 'IN_PROGRESS' ? 'border-l-orange-500'
    : task?.status === 'SUCCESS' ? 'border-l-green-500'
    : 'border-l-blue-500';

  return createPortal(
    <AnimatePresence>
      {task && (
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
            className={`bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border-l-4 ${borderColor}`}
          >
            {/* Header */}
            <div className="p-5 pb-4">
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

            <div className="px-5 pb-5 space-y-4">
              {/* Task Details */}
              {task.taskDetails && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 mb-1">รายละเอียดงาน</p>
                    <p className="text-sm text-slate-700 leading-relaxed break-words max-h-24 overflow-y-auto">
                      {task.taskDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Channel (แสดงเฉพาะเมื่อไม่มี taskDetails แล้ว) */}
              {task.contactChannel && !task.taskDetails && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MessageCircle size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">ช่องทางติดต่อ</p>
                    <p className="text-sm font-bold text-slate-700">
                      {CHANNEL_EMOJI[task.contactChannel] ?? ''} {task.contactChannel}
                    </p>
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
                  <p className="text-sm font-bold text-slate-700">
                    {format(new Date(task.deadline), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
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
                  task.status === 'SUCCESS' ? 'bg-green-100 text-green-700'
                  : task.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.status === 'SUCCESS' ? '✅ Done'
                    : task.status === 'IN_PROGRESS' ? '🔥 In Progress'
                    : '📅 Upcoming'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
