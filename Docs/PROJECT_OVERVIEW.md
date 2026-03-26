# NaukriNote — Project Overview

## 1. Introduction

**NaukriNote** is a full-stack web application designed specifically for **construction site contractors in India**. It provides a complete digital solution for managing multiple construction sites, tracking worker attendance, processing payroll calculations, and facilitating UPI-based payments — all from a single dashboard.

The name **"NaukriNote"** combines "Naukri" (Hindi for "job/employment") with "Note" (record-keeping), reflecting its core purpose of tracking construction employment records.

---

## 2. Problem Statement

Construction contractors in India face critical operational challenges:

| Problem | Impact |
|---------|--------|
| Manual attendance tracking | Inaccurate records, wage disputes |
| Paper-based payroll | Calculation errors, delayed payments |
| Multiple site management | No centralized view of workforce |
| Worker-contractor communication | Workers unaware of their attendance/payment status |
| Payment tracking | No audit trail for UPI payments |

**NaukriNote solves all these problems** with a mobile-friendly digital platform that both contractors and workers can access.

---

## 3. Key Features

### 3.1 Contractor Features (Manager Portal)
- **Multi-Site Management** — Create and manage multiple construction sites from one dashboard
- **Worker Management** — Add workers with daily wage, phone number, and UPI QR code
- **Site-Worker Assignment** — Assign workers to specific sites (many-to-many)
- **Attendance Marking** — Mark daily attendance per site and date (Present/Absent)
- **Attendance Request Approval** — Real-time notifications when workers request attendance
- **Automatic Payroll** — Auto-calculated wages based on attendance × daily wage
- **Payment Tracking** — Record payments with UPI QR and track pending/paid amounts
- **Payment History** — Complete audit trail of all payments per worker

### 3.2 Worker Features (Worker Portal)
- **Phone-based Login** — Workers log in using their 10-digit phone number
- **Attendance Request** — Workers can request attendance from their mobile device
- **Attendance History** — View all past attendance records
- **Earnings Dashboard** — See total earned, total paid, and pending wages

---

## 4. User Roles & Access

| Role | Login Method | Access Level |
|------|-------------|--------------|
| **Contractor** | Email + Password | Full dashboard, all sites, all workers, payroll, attendance |
| **Worker** | Phone Number + Password | Personal attendance, earnings, request attendance |

---

## 5. Application Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing Page | Public |
| `/about` | About Page | Public |
| `/login` | Contractor Login | Public |
| `/signup` | Contractor Signup | Public |
| `/worker/login` | Worker Login | Public |
| `/dashboard` | Sites Dashboard | Contractor Only |
| `/workers` | Workers Management | Contractor Only |
| `/payroll` | Payroll Management | Contractor Only |
| `/attendance` | Attendance Management | Contractor Only |
| `/worker/home` | Worker Home | Worker Only |

---

## 6. Target Users

- **Primary**: Small-to-medium construction contractors in India managing 5–100+ workers
- **Secondary**: Construction workers seeking transparency in their attendance and payments
- **Geography**: India (INR currency, UPI payment system, Hindi terminology)

---

## 7. Project Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | 25+ |
| Lines of Code (JS/JSX) | ~4,500+ |
| React Components | 19 |
| Firestore API Functions | 25 |
| Custom Hooks | 1 |
| Utility Functions | 4 |
| Application Routes | 10 |
| Protected Routes | 5 |
| Public Pages | 5 |

---

## 8. Design Philosophy

NaukriNote follows a **premium dark-themed glassmorphism** design with:
- **Base Color**: `#0f172a` (Deep navy dark)
- **Accent Color**: Orange-to-Amber gradient (`#f97316` → `#f59e0b`)
- **Typography**: Inter font (Google Fonts) — weights 300–900
- **Glass Effects**: 3-tier system (glass-card, glass-light, glass-heavy) with `backdrop-filter: blur()` and `saturate()`
- **Animations**: Fade-in, slide-up, scale-in, shimmer, float, glow-pulse
- **Responsive**: Mobile-first design with dedicated worker mobile UI
