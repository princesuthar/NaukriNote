// Mobile-first home page for workers displaying attendance, earnings, and attendance request options.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getSitesByWorker,
  getAttendanceByWorker,
  getPaymentsByWorker,
  createAttendanceRequest,
} from '../../services/firestoreService'

function WorkerHomePage() {
  const navigate = useNavigate()
  const { workerProfile, logoutWorker } = useAuth()

  // State management
  const [assignedSites, setAssignedSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [paymentRecords, setPaymentRecords] = useState([])
  
  // Separate state for earnings calculation
  const [presentCount, setPresentCount] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)
  
  // UI state
  const [requestSent, setRequestSent] = useState(false)
  const [todayRequested, setTodayRequested] = useState(false)
  const [todayApproved, setTodayApproved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')

  // Format date to "Today: Monday, 26 March 2025" format
  const getFormattedDate = () => {
    const today = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return `Today: ${today.toLocaleDateString('en-IN', options)}`
  }

  // Check if attendance was requested/approved for today
  const checkTodayAttendance = (records, siteId) => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = records.find(
      (r) => r.date === today && r.siteId === siteId
    )

    if (todayRecord) {
      if (todayRecord.status === 'present' || todayRecord.status === 'approved') {
        setTodayApproved(true)
        setTodayRequested(false)
      } else if (todayRecord.status === 'pending') {
        setTodayRequested(true)
        setTodayApproved(false)
      }
    } else {
      setTodayRequested(false)
      setTodayApproved(false)
    }
  }

  // Load all data
  useEffect(() => {
    async function loadData() {
      if (!workerProfile) return
      try {
        setLoading(true)
        setError('')

        const [sites, attendance, payments] = await Promise.all([
          getSitesByWorker(workerProfile.id),
          getAttendanceByWorker(workerProfile.id),
          getPaymentsByWorker(workerProfile.id),
        ])

        setAssignedSites(sites)
        setAttendanceRecords(attendance)
        setPaymentRecords(payments)

        // Calculate stats
        const present = attendance.filter((r) => r.status === 'present')
        setPresentCount(present.length)

        const earned = present.length * (workerProfile.dailyWage || 0)
        setTotalEarned(earned)

        const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        setTotalPaid(paid)
        setPendingAmount(earned - paid)

        // Set first site as default
        if (sites.length > 0) {
          setSelectedSiteId(sites[0].id)
        }
      } catch (err) {
        console.error('Error loading worker data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [workerProfile])

  // Check today's attendance when records or selected site changes
  useEffect(() => {
    if (selectedSiteId && attendanceRecords.length > 0) {
      checkTodayAttendance(attendanceRecords, selectedSiteId)
    }
  }, [selectedSiteId, attendanceRecords])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutWorker()
      navigate('/worker/login', { replace: true })
    } catch (err) {
      setError('Logout failed. Please try again.')
    }
  }

  // Handle request attendance
  const handleRequestAttendance = async () => {
    try {
      setError('')
      setRequesting(true)

      if (!selectedSiteId) {
        setError('Please select a site')
        return
      }

      const today = new Date().toISOString().split('T')[0]

      await createAttendanceRequest({
        workerId: workerProfile.id,
        siteId: selectedSiteId,
        contractorId: workerProfile.contractorId,
        date: today,
      })

      setRequestSent(true)
      setTodayRequested(true)

      // Reset after 3 seconds
      setTimeout(() => setRequestSent(false), 3000)
    } catch (err) {
      console.error('Error requesting attendance:', err)
      setError('Failed to request attendance. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen w-full">
      <div className="max-w-sm mx-auto pb-8">
        {/* Top Header */}
        <div className="bg-gray-900 px-4 py-4 sticky top-0 z-10 flex items-center justify-between">
          <h2 className="text-white font-semibold">👷 Hi, {workerProfile?.name || 'Worker'}!</h2>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-3 text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          {/* Attendance Card */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-white font-bold text-xl">{presentCount}</div>
            <div className="text-gray-400 text-xs mt-1">Days Present</div>
          </div>

          {/* Pending Wages Card */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-orange-400 font-bold text-xl">{formatCurrency(pendingAmount)}</div>
            <div className="text-gray-400 text-xs mt-1">Pending Payment</div>
          </div>
        </div>

        {/* Request Attendance Section */}
        {assignedSites.length > 0 && (
          <div className="px-4 mt-6">
            <h3 className="text-white font-semibold text-lg">Request Attendance</h3>

            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mt-3">
              {/* Site Selector */}
              <div>
                <label htmlFor="site" className="block text-gray-300 text-sm mb-2">
                  Select Site
                </label>
                <select
                  id="site"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={todayRequested || todayApproved}
                  className="w-full px-3 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg text-base focus:outline-none focus:border-orange-500 disabled:opacity-50"
                >
                  <option value="">Select a site</option>
                  {assignedSites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Display */}
              <div className="mt-4 text-gray-300 text-sm">{getFormattedDate()}</div>

              {/* Status Check */}
              {todayApproved ? (
                <div className="mt-4 text-green-400 text-sm font-medium">Attendance marked ✓</div>
              ) : todayRequested ? (
                <div className="mt-4 text-orange-400 text-sm font-medium">Request already sent ✓</div>
              ) : requestSent ? (
                <div className="mt-4 text-orange-400 text-sm font-medium">Request sent! Waiting for approval ⏳</div>
              ) : null}

              {/* Request Button */}
              {!todayRequested && !todayApproved && (
                <button
                  onClick={handleRequestAttendance}
                  disabled={requesting || !selectedSiteId}
                  className="w-full py-3 mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2"
                >
                  {requesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    'Request Attendance'
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Attendance History Section */}
        <div className="px-4 mt-6">
          <h3 className="text-white font-semibold text-lg">Attendance History</h3>

          {attendanceRecords.length === 0 ? (
            <div className="text-gray-500 text-sm text-center mt-4">No attendance records yet</div>
          ) : (
            <div className="space-y-2 mt-2">
              {attendanceRecords.slice(0, 30).map((record) => (
                <div
                  key={record.id}
                  className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white text-sm font-medium">
                      {new Date(record.date).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-gray-400 text-xs">Site {record.siteId?.slice(0, 8)}...</div>
                  </div>

                  {record.status === 'present' || record.status === 'approved' ? (
                    <div className="bg-green-900 text-green-400 rounded-full px-3 py-1 text-xs font-medium">
                      Present
                    </div>
                  ) : record.status === 'absent' ? (
                    <div className="bg-red-900 text-red-400 rounded-full px-3 py-1 text-xs font-medium">
                      Absent
                    </div>
                  ) : (
                    <div className="bg-gray-700 text-gray-300 rounded-full px-3 py-1 text-xs font-medium">
                      {record.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Earnings Section */}
        <div className="px-4 mt-6">
          <h3 className="text-white font-semibold text-lg">My Earnings</h3>

          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mt-3">
            {/* Daily Wage */}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-300">Daily Wage</span>
              <span className="text-white font-medium">
                {formatCurrency(workerProfile?.dailyWage)} / day
              </span>
            </div>

            {/* Total Days Present */}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-300">Total Days Present</span>
              <span className="text-white font-medium">{presentCount} days</span>
            </div>

            {/* Total Earned */}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-300">Total Earned</span>
              <span className="text-white font-medium">{formatCurrency(totalEarned)}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-600 my-3" />

            {/* Total Paid */}
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-300">Total Paid</span>
              <span className="text-green-400 font-medium">{formatCurrency(totalPaid)}</span>
            </div>

            {/* Pending */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Pending</span>
              <span className="text-orange-400 font-bold text-lg">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerHomePage
