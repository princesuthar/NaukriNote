# NaukriNote

<div align="center">
  <img src="./public/favicon.svg" alt="NaukriNote Logo" width="120" />
  <p><strong>Workforce management for construction contractors</strong></p>

  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28.svg)](https://firebase.google.com/)
</div>

NaukriNote is a React + Vite + Firebase application for construction contractors in India. It digitizes site management, worker records, attendance, payroll, and UPI payment tracking in one mobile-friendly dashboard.

## What It Does

- Manages multiple construction sites from a single contractor account.
- Stores worker profiles with phone number, daily wage, site assignments, and optional UPI QR images.
- Lets contractors mark attendance or approve worker attendance requests.
- Calculates wages from attendance and tracks payments against pending balances.
- Gives workers a lightweight mobile portal to request attendance and review their earnings.

## Main Flows

- Contractor login and signup use Firebase Auth email/password.
- Worker login uses a synthetic email generated from the worker phone number.
- Worker attendance requests can be geofence-checked in the mobile flow before submission.
- Contractor payroll actions and worker attendance data are stored in Firestore.

## Tech Stack

- React 18
- Vite 8
- React Router DOM 7
- Firebase Authentication and Firestore
- Cloudinary for worker UPI QR uploads
- Tailwind CSS with a custom glassmorphism layer

## Routes

- `/` public landing page
- `/about` public about page
- `/login` contractor login
- `/signup` contractor signup
- `/worker/login` worker login
- `/dashboard` contractor site dashboard
- `/workers` contractor worker management
- `/payroll` contractor payroll management
- `/attendance` contractor attendance management
- `/worker/home` worker dashboard

## Documentation

Detailed design and implementation notes live in the [`Docs/`](./Docs/) folder:

- [Project Overview](./Docs/PROJECT_OVERVIEW.md)
- [Architecture](./Docs/ARCHITECTURE.md)
- [Database Schema](./Docs/DATABASE_SCHEMA.md)
- [API Reference](./Docs/API_REFERENCE.md)
- [Algorithms](./Docs/ALGORITHMS.md)
- [Tech Stack](./Docs/TECH_STACK.md)

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A Firebase project with Authentication and Firestore enabled
- A Cloudinary account for QR image uploads

### Install

```bash
git clone <repository-url>
cd NaukriNote
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=optional_measurement_id

VITE_CLOUDINARY_URL=your_cloudinary_name_or_upload_endpoint
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Run Locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## Deployment

The app is configured for Firebase Hosting and Vite output in `dist/`.

Typical deployment flow:

```bash
npm run build
firebase deploy
```

The repository also includes GitHub Actions workflow files under `.github/workflows/`; if you plan to use them, make sure the build step matches this Vite setup.

## Project Structure

```text
src/
  components/   reusable UI pieces and layout shells
  context/      auth/session state
  firebase/     Firebase app initialization
  hooks/        shared React hooks
  pages/        public, contractor, and worker screens
  routes/       route definitions and guards
  services/     Firestore and Cloudinary access
  utils/        helper functions
Docs/           architecture and implementation notes
```

## Design System

The UI uses a dark glassmorphism style built around:

- Deep navy surfaces
- Orange and amber gradient accents
- Glass cards, inputs, and overlays
- Inter typography from Google Fonts

## License

This project is proprietary and intended for internal use. All rights reserved.
