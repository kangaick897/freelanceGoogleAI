import { supabase } from '@/lib/supabase';
import { Task, TaskStatus, Payment } from '@/store/useStore';

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
  if (error) {
    console.error('Error inserting task:', error);
    return;
  }

  // หากสร้างงานแล้วมีเงินชำระเลย ให้บันทึกลง payments ด้วย
  if (task.paidAmount > 0) {
    await insertPaymentRecord({
      id: crypto.randomUUID(),
      taskId: task.id,
      amount: task.paidAmount,
      paymentDate: new Date().toISOString(),
    });
  }
}

// โหลดข้อมูล Payments ทั้งหมดของผู้ใช้ (อิงตามงาน)
export async function fetchPayments(taskIds: string[]): Promise<Payment[]> {
  if (taskIds.length === 0) return [];
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .in('task_id', taskIds);

  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }

  return (data ?? []).map(p => ({
    id: p.id,
    taskId: p.task_id,
    amount: Number(p.amount),
    paymentDate: p.payment_date,
  }));
}

// เพิ่มประวัติการชำระเงิน
export async function insertPaymentRecord(payment: Payment): Promise<void> {
  const { error } = await supabase.from('payments').insert({
    id: payment.id,
    task_id: payment.taskId,
    amount: payment.amount,
    payment_date: payment.paymentDate,
  });
  if (error) console.error('Error inserting payment:', error);
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

// ลบข้อมูลงานและประวัติการเงินทั้งหมดของ user (payments ลบอัตโนมัติจาก ON DELETE CASCADE)
export async function deleteAllUserData(userId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('user_id', userId);
  if (error) console.error('Error deleting user data:', error);
}
