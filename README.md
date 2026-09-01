# 🏭 Carton ERP — نظام إدارة وتشغيل مصنع الكرتون المضلع

نظام متكامل لتخطيط وإدارة العمليات الصناعية والمالية لمصانع الكرتون المضلع (Corrugated Carton Factory ERP).

---

## 🔑 بيانات تسجيل الدخول الافتراضية (Default Accounts)

| الحساب | البريد الإلكتروني | كلمة المرور | الدور |
|---|---|---|---|
| **مدير النظام (Super Admin)** | `admin@carton-erp.com` | `Admin@123456` | صلاحيات كاملة للنظام |
| **مدير المصنع (Factory Manager)** | `manager@carton-erp.com` | `Manager@123456` | إدارة الإنتاج والمبيعات والمخازن |

---

## 🚀 دليل التشغيل والإعداد الفوري (Quickstart Guide)

إذا قمت بعمل `git clone` للمشروع على جهازك، اتبع الخطوات التالية للتشغيل فوراً:

### 1️⃣ إنشاء ملف المتغيرات (.env.local)
قم بنسخ ملف `.env.example` إلى `.env.local`:
```bash
cp .env.example .env.local
```
*(الملف يحتوي بالفعل على الـ API Keys الجاهزة للربط مع Supabase).*

---

### 2️⃣ تثبيت الحزم وتشغيل النظام (Run Dev Server)
```bash
npm install
npm run dev
```
افتح المتصفح على: **[http://localhost:3005](http://localhost:3005)**

---

### 🗄️ (اختياري) إعداد قاعدة بيانات جديدة (Setup New Database)
إذا أردت إنشاء قاعدة بيانات جديدة على مشروعك الخاص في Supabase:
```bash
npm run setup-db <DB_PASSWORD>
```
سيقوم السكريبت تلقائياً بـ:
1. إنشاء كافة الجداول الـ 45 والدوال والقيود والمحركات المحاسبية.
2. إنشاء الأدوار والبيانات الأولية (Seed Data).
3. إنشاء حساب مدير النظام (`admin@carton-erp.com`).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
- **Framework**: Next.js 16 (App Router & Turbopack)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Language**: TypeScript & Full i18n (Arabic RTL / English LTR)
