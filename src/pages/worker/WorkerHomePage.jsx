// Premium worker home page with glassmorphism cards and gradient accents.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getSitesByWorker, getAttendanceByWorker, getPaymentsByWorker, createAttendanceRequest } from '../../services/firestoreService'

function WorkerHomePage() {
  const navigate = useNavigate()
  const { workerProfile, logoutWorker } = useAuth()
  const [assignedSites, setAssignedSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [presentCount, setPresentCount] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [requestSent, setRequestSent] = useState(false)
  const [todayRequested, setTodayRequested] = useState(false)
  const [todayApproved, setTodayApproved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')

  const fmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const today = () => new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!workerProfile) return
    setLoading(true)
    Promise.all([getSitesByWorker(workerProfile.id), getAttendanceByWorker(workerProfile.id), getPaymentsByWorker(workerProfile.id)])
      .then(([sites, att, pay]) => {
        setAssignedSites(sites); setAttendanceRecords(att)
        const p = att.filter((r) => r.status === 'present')
        setPresentCount(p.length)
        const earned = p.length * (workerProfile.dailyWage || 0)
        setTotalEarned(earned)
        const paid = pay.reduce((s, x) => s + (x.amount || 0), 0)
        setTotalPaid(paid); setPendingAmount(earned - paid)
        if (sites.length > 0) setSelectedSiteId(sites[0].id)
      }).catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [workerProfile])

  useEffect(() => {
    if (!selectedSiteId || !attendanceRecords.length) return
    const t = today()
    const rec = attendanceRecords.find((r) => r.date === t && r.siteId === selectedSiteId)
    if (rec?.status === 'present' || rec?.status === 'approved') { setTodayApproved(true); setTodayRequested(false) }
    else if (rec?.status === 'pending') { setTodayRequested(true); setTodayApproved(false) }
    else { setTodayRequested(false); setTodayApproved(false) }
  }, [selectedSiteId, attendanceRecords])

  const handleLogout = async () => { try { await logoutWorker(); navigate('/worker/login', { replace: true }) } catch { setError('Logout failed.') } }

  const handleRequest = async () => {
    if (!selectedSiteId) { setError('Select a site'); return }
    setRequesting(true); setError('')
    try {
      await createAttendanceRequest({ workerId: workerProfile.id, siteId: selectedSiteId, contractorId: workerProfile.contractorId, date: today() })
      setRequestSent(true); setTodayRequested(true)
      setTimeout(() => setRequestSent(false), 3000)
    } catch { setError('Failed to request attendance.') }
    finally { setRequesting(false) }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-surface-400"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen w-full bg-surface-400">
      <div className="mx-auto max-w-sm pb-8">
        <div className="sticky top-0 z-10 border-b border-white/5 bg-surface-400/90 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-glow">{(workerProfile?.name || 'W')[0].toUpperCase()}</div>
              <h2 className="font-semibold text-white">Hi, {workerProfile?.name || 'Worker'}!</h2>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-400">Logout</button>
          </div>
        </div>

        {error && <div className="mx-4 mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          <div className="glass-card p-4"><div className="text-xl font-bold text-white">{presentCount}</div><div className="mt-1 text-xs text-gray-500">Days Present</div></div>
          <div className="glass-card p-4"><div className="text-xl font-bold text-brand-400">{fmt(pendingAmount)}</div><div className="mt-1 text-xs text-gray-500">Pending Payment</div></div>
        </div>

        {assignedSites.length > 0 && (
          <div className="mt-6 px-4">
            <h3 className="text-lg font-semibold text-white">Request Attendance</h3>
            <div className="glass-card mt-3 p-4">
              <label htmlFor="site" className="mb-2 block text-sm text-gray-400">Select Site</label>
              <select id="site" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} disabled={todayRequested || todayApproved} className="select-field">
                <option value="">Select a site</option>
                {assignedSites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="mt-4 text-sm text-gray-400">Today: {dateStr}</div>
              {todayApproved && <div className="badge-success mt-4">Attendance marked ✓</div>}
              {todayRequested && !todayApproved && <div className="badge-warning mt-4">Request sent ✓</div>}
              {requestSent && !todayRequested && <div className="badge-warning mt-4">Waiting for approval ⏳</div>}
              {!todayRequested && !todayApproved && (
                <button onClick={handleRequest} disabled={requesting || !selectedSiteId} className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3">
                  {requesting ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Requesting...</> : 'Request Attendance'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 px-4">
          <h3 className="text-lg font-semibold text-white">Attendance History</h3>
          {!attendanceRecords.length ? <p className="mt-4 text-center text-sm text-gray-500">No records yet</p> : (
            <div className="mt-2 space-y-2">{attendanceRecords.slice(0, 30).map((r) => (
              <div key={r.id} className="glass-card flex items-center justify-between px-4 py-3">
                <div><div className="text-sm font-medium text-white">{new Date(r.date).toLocaleDateString('en-IN')}</div><div className="text-xs text-gray-500">Site {r.siteId?.slice(0, 8)}...</div></div>
                {r.status === 'present' || r.status === 'approved' ? <span className="badge-success text-[11px]">Present</span> : r.status === 'absent' ? <span className="badge-danger text-[11px]">Absent</span> : <span className="badge-neutral text-[11px]">{r.status}</span>}
              </div>
            ))}</div>
          )}
        </div>

        <div className="mt-6 px-4">
          <h3 className="text-lg font-semibold text-white">My Earnings</h3>
          <div className="glass-card mt-3 p-4">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Daily Wage</span><span className="text-white">{fmt(workerProfile?.dailyWage)} / day</span></div>
            <div className="mt-3 flex justify-between text-sm"><span className="text-gray-400">Days Present</span><span className="text-white">{presentCount} days</span></div>
            <div className="mt-3 flex justify-between text-sm"><span className="text-gray-400">Total Earned</span><span className="text-white">{fmt(totalEarned)}</span></div>
            <div className="my-3 border-t border-white/5" />
            <div className="flex justify-between text-sm"><span className="text-gray-400">Total Paid</span><span className="text-emerald-400">{fmt(totalPaid)}</span></div>
            <div className="mt-3 flex justify-between text-sm"><span className="text-gray-400">Pending</span><span className="text-lg font-bold text-brand-400">{fmt(pendingAmount)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerHomePage
