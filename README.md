<div align="center">
  <img src="./public/favicon.svg" alt="NaukriNote Logo" width="120" />
  <h1>NaukriNote</h1>
  <p><strong>Workforce Management for Construction Contractors</strong></p>
  
  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28.svg)](https://firebase.google.com/)
</div>

---

## 🏗️ What is NaukriNote?

**NaukriNote** is a comprehensive full-stack web application designed specifically for construction site contractors in India. It replaces manual, paper-based records with a secure digital platform for managing multiple sites, tracking worker attendance, calculating payroll automatically, and maintaining a complete audit trail of UPI payments.

### ✨ Key Features
- **Multi-Site Dashboard:** Manage all your construction projects from a single view.
- **Worker Profiles:** Store contact info, daily wages, and UPI QR codes securely.
- **Digital Attendance:** Mark workers Present/Absent with one tap, or let workers request attendance from their phones.
- **Automated Payroll:** Automatic calculation of earned wages based on verified attendance records.
- **Payment Tracking:** Record UPI payments and see real-time pending balances.

---

## 📚 Comprehensive Documentation

We have detailed documentation for every aspect of the project in the [`docs/`](./docs/) folder:

1. 📖 **[Project Overview](./docs/PROJECT_OVERVIEW.md)** — Problem statement, feature breakdown, user roles, and design system.
2. 🛠️ **[Tech Stack](./docs/TECH_STACK.md)** — Frontend frameworks, backend services, CSS architecture, and dependencies.
3. 🗺️ **[Architecture](./docs/ARCHITECTURE.md)** — System diagrams, data flow patterns, component hierarchy, and security model.
4. 🗄️ **[Database Schema](./docs/DATABASE_SCHEMA.md)** — Firestore collections, entity relationships, fields, and index requirements.
5. ⚙️ **[APIs & Services](./docs/API_REFERENCE.md)** — Comprehensive guide to the 25+ Firestore functions, Firebase Auth, and Cloudinary integrations.
6. 🧠 **[Algorithms & Logic](./docs/ALGORITHMS.md)** — Mathematical logic for payroll, phone-auth conversion, performance metrics (FCP < 1.5s), and scalability characteristics.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Firebase project (Authentication & Firestore enabled)
- A Cloudinary account (for QR code uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NaukriNote
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   VITE_CLOUDINARY_URL=your_cloudinary_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🎨 UI/UX Design

NaukriNote uses a premium **Dark Theme + Glassmorphism** design system:
- **Base:** Deep Navy (`#0f172a`)
- **Accent:** Orange-to-Amber Gradient (`#f97316` → `#f59e0b`)
- **Effects:** A 3-tier CSS glassmorphism system (`glass-card`, `glass-light`, `glass-heavy`) with background blurring and edge highlighting.
- **Typography:** Inter (Google Fonts)

---

## 🛡️ License

This project is proprietary and intended for internal use. All rights reserved.
