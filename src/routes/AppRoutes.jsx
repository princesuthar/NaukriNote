// Central route definitions for public, contractor, and worker pages.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from '../pages/public/LandingPage'
import AboutPage from '../pages/public/AboutPage'
import LoginPage from '../pages/public/LoginPage'
import SignupPage from '../pages/public/SignupPage'
import SitesDashboard from '../pages/contractor/SitesDashboard'
import WorkersPage from '../pages/contractor/WorkersPage'
import PayrollPage from '../pages/contractor/PayrollPage'
import AttendancePage from '../pages/contractor/AttendancePage'
import WorkerLoginPage from '../pages/worker/WorkerLoginPage'
import WorkerHomePage from '../pages/worker/WorkerHomePage'
import { ContractorRoute, WorkerRoute } from './ProtectedRoute'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/worker/login" element={<WorkerLoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ContractorRoute>
              <SitesDashboard />
            </ContractorRoute>
          }
        />
        <Route
          path="/workers"
          element={
            <ContractorRoute>
              <WorkersPage />
            </ContractorRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ContractorRoute>
              <PayrollPage />
            </ContractorRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ContractorRoute>
              <AttendancePage />
            </ContractorRoute>
          }
        />
        <Route
          path="/worker/home"
          element={
            <WorkerRoute>
              <WorkerHomePage />
            </WorkerRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
