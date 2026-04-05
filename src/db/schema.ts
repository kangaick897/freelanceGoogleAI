import { pgTable, uuid, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';

// Enum สำหรับสถานะงาน
export const statusEnum = pgEnum('status', ['UPCOMING', 'IN_PROGRESS', 'SUCCESS']);

// Table: users (เชื่อมกับ auth.users ของ Supabase)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // ใช้ UUID เดียวกับ Supabase Auth
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'), // รองรับลิงก์ฝากรูปฟรี
  themeColor: text('theme_color').default('blue').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table: categories (หมวดหมู่งาน)
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(), // เก็บค่าสีของแท็ก
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table: tasks (คิวงาน)
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskName: text('task_name').notNull(),
  clientName: text('client_name').notNull(),
  deadline: timestamp('deadline').notNull(),
  price: numeric('price').notNull(),
  paidAmount: numeric('paid_amount').default('0').notNull(),
  status: statusEnum('status').default('UPCOMING').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  notes: text('notes'), // สำหรับจดรายละเอียดเพิ่มเติมหรือลิงก์บรีฟงาน
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
