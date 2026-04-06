import { supabase } from '@/lib/supabase';
import { Task, TaskStatus } from '@/store/useStore';

// ดึงข้อมูลงานทั้งหมดของ user จาก Supabase
export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data ?? []).map(t => ({
    id: t.id,
    taskName: t.task_name,
    clientName: t.client_name,
    contactChannel: t.contact_channel ?? undefined,
    taskDetails: t.task_details ?? undefined,
    deadline: t.deadline,
    price: Number(t.price),
    paidAmount: Number(t.paid_amount),
    status: t.status as TaskStatus,
    categoryId: t.category_id,
    createdAt: t.created_at,
  }));
}

// บันทึกงานใหม่ลงใน Supabase
export async function insertTask(userId: string, task: Task): Promise<void> {
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    user_id: userId,
    task_name: task.taskName,
    client_name: task.clientName,
    contact_channel: task.contactChannel ?? null,
    task_details: task.taskDetails ?? null,
    deadline: task.deadline,
    price: task.price,
    paid_amount: task.paidAmount,
    status: task.status,
    category_id: task.categoryId,
    created_at: task.createdAt,
  });
  if (error) console.error('Error inserting task:', error);
}

// อัปเดตสถานะงาน
export async function patchTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
  if (error) console.error('Error updating task status:', error);
}

// อัปเดตยอดชำระ
export async function patchTaskPaidAmount(id: string, paidAmount: number): Promise<void> {
  const { error } = await supabase.from('tasks').update({ paid_amount: paidAmount }).eq('id', id);
  if (error) console.error('Error updating paid amount:', error);
}
