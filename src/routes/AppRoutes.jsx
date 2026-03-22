// Central route definitions for public, contractor, and worker pages.
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/" element={<LandingPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/about" element={<AboutPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/login" element={<LoginPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/signup" element={<SignupPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/dashboard" element={<SitesDashboard />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/workers" element={<WorkersPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/payroll" element={<PayrollPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/attendance" element={<AttendancePage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/worker/login" element={<WorkerLoginPage />} />
        {/* protected route — auth guard added in Phase 3 */}
        <Route path="/worker/home" element={<WorkerHomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
