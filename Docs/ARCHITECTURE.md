# NaukriNote — Architecture & Folder Structure

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐              │
│  │  React   │  │ Tailwind │  │   Vite    │              │
│  │ 18.3.1   │  │  3.4.19  │  │   8.0.1   │              │
│  └────┬─────┘  └──────────┘  └───────────┘              │
│       │                                                  │
│  ┌────┴──────────────────────────────────┐               │
│  │          React Router DOM             │               │
│  │     (Public / Protected Routes)       │               │
│  └────┬──────────────┬───────────────────┘               │
│       │              │                                   │
│  ┌────┴────┐   ┌─────┴──────┐                            │
│  │Contractor│   │  Worker    │                            │
│  │ Portal   │   │  Portal   │                            │
│  └────┬─────┘   └─────┬─────┘                            │
│       │               │                                  │
│  ┌────┴───────────────┴──────┐                           │
│  │      AuthContext          │                           │
│  │  (Auth State Provider)    │                           │
│  └────┬──────────────────────┘                           │
└───────┼──────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                  FIREBASE (Google Cloud)                   │
│                                                           │
│  ┌──────────────┐   ┌────────────────┐                    │
│  │  Firebase     │   │   Cloud        │                    │
│  │  Auth         │   │   Firestore    │                    │
│  │  (Users)      │   │   (Database)   │                    │
│  └──────────────┘   └────────────────┘                    │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────┐
│   Cloudinary CDN      │
│   (QR Image Storage)  │
└───────────────────────┘
```

---

## 2. Folder Structure

```
NaukriNote/
├── docs/                          # Project documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── TECH_STACK.md
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md            # This file
│   ├── DATABASE_SCHEMA.md
│   └── ALGORITHMS.md
│
├── public/
│   └── favicon.svg                # Brand favicon (orange notepad + hardhat)
│
├── src/
│   ├── components/
│   │   ├── common/                # Shared reusable components
│   │   │   ├── Logo.jsx           # SVG brand logo component
│   │   │   ├── Modal.jsx          # Glassmorphism modal overlay
│   │   │   ├── Toast.jsx          # Toast notification system
│   │   │   ├── FeatureCard.jsx    # Landing page feature card
│   │   │   └── TestimonialCard.jsx # Landing page testimonial card
│   │   │
│   │   └── layout/                # Layout wrappers
│   │       ├── PublicNavbar.jsx   # Public pages navbar (glass on scroll)
│   │       ├── Footer.jsx         # Public pages footer
│   │       └── DashboardLayout.jsx # Contractor dashboard shell
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state provider (contractor + worker)
│   │
│   ├── firebase/
│   │   └── firebaseConfig.js      # Firebase app initialization
│   │
│   ├── hooks/
│   │   └── useToast.js            # Custom hook for toast notifications
│   │
│   ├── pages/
│   │   ├── public/                # Public-facing pages
│   │   │   ├── LandingPage.jsx    # Home/marketing page
│   │   │   ├── AboutPage.jsx      # About page
│   │   │   ├── LoginPage.jsx      # Contractor login
│   │   │   └── SignupPage.jsx     # Contractor registration
│   │   │
│   │   ├── contractor/            # Contractor dashboard pages
│   │   │   ├── SitesDashboard.jsx # Sites overview + stats
│   │   │   ├── WorkersPage.jsx    # Worker CRUD + assignments
│   │   │   ├── PayrollPage.jsx    # Payroll calculations + payments
│   │   │   └── AttendancePage.jsx # Attendance marking + requests
│   │   │
│   │   └── worker/                # Worker-facing pages
│   │       ├── WorkerLoginPage.jsx # Worker phone login
│   │       └── WorkerHomePage.jsx  # Worker dashboard
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx          # Route definitions
│   │   └── ProtectedRoute.jsx     # Auth guard components
│   │
│   ├── services/
│   │   ├── firestoreService.js    # All Firestore CRUD operations (25+ functions)
│   │   └── cloudinaryService.js   # QR image upload service
│   │
│   ├── utils/
│   │   └── helpers.js             # Date, currency, phone utilities
│   │
│   ├── App.jsx                    # Root component (AuthProvider wrapper)
│   ├── main.jsx                   # Entry point (React DOM render)
│   └── index.css                  # Global styles + glassmorphism system
│
├── .env                           # Environment variables (Firebase + Cloudinary keys)
├── .gitignore                     # Git ignore rules
├── index.html                     # HTML shell
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind theme customization
├── postcss.config.js              # PostCSS configuration
└── vite.config.js                 # Vite build configuration
```

---

## 3. Data Flow Patterns

### 3.1 Contractor Login Flow
```
LoginPage → AuthContext.loginContractor()
  → Firebase signInWithEmailAndPassword()
  → Firestore getContractor(uid)
  → Set contractorUser + contractorProfile state
  → Navigate to /dashboard
```

### 3.2 Worker Login Flow
```
WorkerLoginPage → AuthContext.loginWorker(phone, password)
  → phoneToEmail(phone) → "91{phone}@worksite.com"
  → Firebase signInWithEmailAndPassword()
  → Firestore getWorkerByPhone(phone)
  → Set workerUser + workerProfile state
  → Navigate to /worker/home
```

### 3.3 Attendance Request Flow
```
Worker (WorkerHomePage):
  → createAttendanceRequest({workerId, siteId, contractorId, date})
  → Firestore adds doc to 'attendance_requests' with status: 'pending'

Contractor (AttendancePage):
  → onSnapshot() listener detects new pending request (real-time)
  → Contractor clicks Approve/Reject
  → updateRequestStatus(requestId, 'approved'/'rejected')
  → If approved: markAttendance({...data, status: 'present'})
```

### 3.4 Payroll Calculation Flow
```
PayrollPage → calculatePendingWages(workerId):
  → Fetch attendance where status === 'present' → count presentDays
  → Fetch worker → get dailyWage
  → totalEarned = presentDays × dailyWage
  → Fetch payments → sum all amounts → totalPaid
  → pendingAmount = max(totalEarned - totalPaid, 0)
```

---

## 4. Component Hierarchy

```
App.jsx
  └── AuthProvider
        └── AppRoutes
              ├── PublicNavbar + LandingPage + Footer
              ├── PublicNavbar + AboutPage + Footer
              ├── LoginPage
              ├── SignupPage
              ├── WorkerLoginPage
              ├── ContractorRoute
              │     └── DashboardLayout
              │           ├── SitesDashboard + Modal + Toast
              │           ├── WorkersPage + Modal + Toast
              │           ├── PayrollPage + Modal + Toast
              │           └── AttendancePage + Toast
              └── WorkerRoute
                    └── WorkerHomePage
```

---

## 5. State Management

NaukriNote uses **React Context + local component state** (no Redux/Zustand):

| Layer | Method | Scope |
|-------|--------|-------|
| **Auth State** | `AuthContext` (React Context) | Global — available to all components |
| **Page Data** | `useState` + `useEffect` | Local — each page fetches its own data |
| **UI State** | `useState` | Local — modals, forms, loading flags |
| **Computed Data** | `useMemo` | Derived — filtered lists, summary stats |
| **Real-time Data** | Firestore `onSnapshot` | Subscription — attendance requests |

---

## 6. Security Model

| Layer | Implementation |
|-------|---------------|
| **Authentication** | Firebase Auth (email/password) |
| **Route Protection** | `ContractorRoute` / `WorkerRoute` components redirect unauthenticated users |
| **Data Isolation** | All Firestore queries filter by `contractorId` — a contractor only sees their own data |
| **Worker Isolation** | Workers can only view their own attendance and earnings (filtered by `workerId`) |
| **File Upload** | Cloudinary unsigned preset (limited to specific upload settings) |
| **Env Variables** | Firebase config stored in `.env` (not committed to git) |
