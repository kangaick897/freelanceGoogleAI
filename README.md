# 💼 FreelanceFlow

**FreelanceFlow** คือแอปบริหารงาน Freelance แบบครบวงจร ออกแบบมาเพื่อช่วยให้ Freelancer จัดการคิวงาน ติดตามการเงิน และวิเคราะห์รายได้ได้ในที่เดียว รองรับการใช้งานบนมือถือและ Tablet เป็นหลัก

---

## ✨ Features

### 📋 Task Queue Management
- เพิ่มงานใหม่พร้อมกำหนด ชื่อลูกค้า, ช่องทางติดต่อ, ชื่องาน, รายละเอียดงาน, Deadline, ราคา, และหมวดหมู่
- รองรับการบันทึกมัดจำตอนเพิ่มงาน
- จัดการสถานะงาน: `UPCOMING` → `IN_PROGRESS` → `SUCCESS`
- ดูรายละเอียดงานและอัปเดตสถานะ/การชำระเงินได้ทันที

### 💰 Financial Tracking
- **Collected Revenue Page:** ดูรายรับรายเดือน เลื่อนย้อนหลัง-ไปข้างหน้าได้ พร้อมรายการ Transaction แต่ละก้อนที่แสดงชื่อลูกค้า, ชื่องาน, หมวดหมู่ และเวลาที่รับเงิน
- **Pending Payments Page:** ดูงานที่ยังค้างชำระทั้งหมด พร้อมกดเพิ่มยอดจ่ายหรือกด Fully Paid ได้ทันที
- ระบบ Payment History ที่เก็บประวัติการรับเงินแต่ละก้อนพร้อม Timestamp แม่นยำ

### 📊 Dashboard & Analytics
- สรุปยอด Collected และ Pending รายเดือน
- Donut Chart แบ่งรายได้ตามหมวดหมู่งาน
- Bar Chart แสดงแนวโน้มรายรับ-รายค้างตามสัปดาห์/เดือน
- Filter เดือนได้

### 🏷️ Categories
- สร้างหมวดหมู่งานเองได้ พร้อมเลือกสีตามใจ (Design, Video Edit, Coding, etc.)

### 🎨 Theme Engine
- เลือกธีมสีได้ 5 แบบ: Blue, Pink, Green, Purple, Orange
- บันทึกค่า Theme ลง Supabase ให้ sync ข้ามอุปกรณ์ได้

### 🔐 Auth & Data
- ระบบ Login ด้วย Email/Password ผ่าน Supabase Auth
- ข้อมูลทั้งหมดเก็บใน Supabase (PostgreSQL) และ Sync แบบ Real-time
- รีเซทข้อมูลงานและการเงินทั้งหมดได้จากหน้า Settings

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand (with persist) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| ORM (Schema) | Drizzle ORM |

---

## 🚀 Run Locally

**Prerequisites:** Node.js, Supabase Project

1. Clone repo และติดตั้ง dependencies:
   ```bash
   npm install
   ```

2. สร้างไฟล์ `.env.local` และใส่ค่า:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. รัน SQL นี้ใน Supabase SQL Editor เพื่อสร้างตาราง `payments`:
   ```sql
   CREATE TABLE payments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
     amount NUMERIC NOT NULL,
     payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

4. รันแอป:
   ```bash
   npm run dev
   ```
