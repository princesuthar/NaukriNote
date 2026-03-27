// Premium attendance page with glassmorphism tabs, tables, and request cards.
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../firebase/firebaseConfig'
import useToast from '../../hooks/useToast'
import { getAttendanceByDate, getSitesByContractor, getWorkerById, getWorkersBySite, markAttendance, updateRequestStatus } from '../../services/firestoreService'
import { getTodayString } from '../../utils/helpers'

function AttendancePage() {
  const { contractorUser } = useAuth()
  const { toast, showToast, hideToast } = useToast()
  const [activeTab, setActiveTab] = useState('mark')
  const [sites, setSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [workers, setWorkers] = useState([])
  const [statusMap, setStatusMap] = useState({})
  const [loadingWorkers, setLoadingWorkers] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [resolvingIds, setResolvingIds] = useState([])

  useEffect(() => {
    if (!contractorUser?.uid) return
    getSitesByContractor(contractorUser.uid).then((list) => {
      setSites(list)
      if (list.length > 0) setSelectedSiteId((p) => p || list[0].id)
    }).catch(() => showToast('Could not load sites', 'error'))
  }, [contractorUser?.uid])

  useEffect(() => {
    if (!contractorUser?.uid) return undefined
    setPendingLoading(true)
    const q = query(collection(db, 'attendance_requests'), where('contractorId', '==', contractorUser.uid), where('status', '==', 'pending'))
    return onSnapshot(q, async (snap) => {
      const reqs = await Promise.all(snap.docs.map(async (d) => {
        const data = d.data()
        let w = null; try { w = await getWorkerById(data.workerId) } catch {}
        return { id: d.id, ...data, workerName: w?.name || 'Worker', workerPhone: w?.phone || '-' }
      }))
      reqs.sort((a, b) => (b.requestedAt?.seconds || 0) - (a.requestedAt?.seconds || 0))
      setPendingRequests(reqs); setPendingLoading(false)
    }, () => { setPendingLoading(false) })
  }, [contractorUser?.uid])

  const loadWorkers = async () => {
    if (!selectedSiteId || !selectedDate) return
    setLoadingWorkers(true)
    try {
      const w = await getWorkersBySite(selectedSiteId)
      if (!w?.length) { setWorkers([]); setStatusMap({}); showToast('No workers assigned', 'info'); return }
      const att = await getAttendanceByDate(selectedSiteId, selectedDate)
      setWorkers(w); setStatusMap(att.reduce((a, e) => { a[e.workerId] = e.status; return a }, {}))
      showToast(`Loaded ${w.length} workers`, 'success')
    } catch { showToast('Could not load workers', 'error') }
    finally { setLoadingWorkers(false) }
  }

  const siteName = useMemo(() => sites.find((s) => s.id === selectedSiteId)?.name || 'Site', [selectedSiteId, sites])

  const mark = async (worker, status) => {
    const prev = statusMap[worker.id]; if (prev === status) return
    setStatusMap((p) => ({ ...p, [worker.id]: status }))
    try { await markAttendance({ contractorId: contractorUser.uid, workerId: worker.id, siteId: selectedSiteId, date: selectedDate, status }); showToast('Marked', 'success') }
    catch { setStatusMap((p) => ({ ...p, [worker.id]: prev })); showToast('Failed', 'error') }
  }

  const handleAction = async (r, action) => {
    setResolvingIds((p) => [...p, r.id])
    try {
      await updateRequestStatus(r.id, action)
      if (action === 'approved') await markAttendance({ contractorId: r.contractorId, workerId: r.workerId, siteId: r.siteId, date: r.date, status: 'present', source: 'request' })
      showToast(action === 'approved' ? 'Approved' : 'Rejected', 'success')
    } catch { showToast('Failed', 'error') }
    finally { setResolvingIds((p) => p.filter((id) => id !== r.id)) }
  }

  const tabCls = (t) => activeTab === t ? 'btn-primary px-4 py-2 text-sm' : 'btn-secondary px-4 py-2 text-sm'

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-6">
        <section className="glass-card flex flex-wrap items-center gap-3 p-3">
          <button type="button" onClick={() => setActiveTab('mark')} className={tabCls('mark')}>Mark Attendance</button>
          <button type="button" onClick={() => setActiveTab('pending')} className={`${tabCls('pending')} inline-flex items-center gap-2`}>
            Pending Requests{pendingRequests.length > 0 && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">{pendingRequests.length}</span>}
          </button>
        </section>

        {activeTab === 'mark' ? (
          <section className="space-y-4">
            <div className="glass-card grid grid-cols-1 gap-3 p-4 md:grid-cols-[1fr_200px_auto]">
              <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} className="select-field">{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" />
              <button type="button" onClick={loadWorkers} className="btn-primary px-4 py-2 text-sm">Load Workers</button>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="border-b border-white/5 px-4 py-3 text-sm text-gray-400">{siteName} — {selectedDate}</div>
              {loadingWorkers ? <div className="space-y-2 p-4">{[1,2,3,4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-white/[0.04]" />)}</div>
              : !workers.length ? <p className="p-6 text-sm text-gray-400">Load workers to begin.</p>
              : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="bg-white/[0.03] text-left uppercase tracking-wide text-gray-400"><tr><th className="px-4 py-3">Worker</th><th className="px-4 py-3">Wage</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
                <tbody className="divide-y divide-white/5">{workers.map((w) => {
                  const cs = statusMap[w.id]
                  return <tr key={w.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3"><p className="font-medium text-white">{w.name}</p><p className="text-xs text-gray-500">{w.phone}</p></td>
                    <td className="px-4 py-3 text-emerald-400">₹{w.dailyWage}</td>
                    <td className="px-4 py-3">{cs === 'present' ? <span className="badge-success">Present ✓</span> : cs === 'absent' ? <span className="badge-danger">Absent ✗</span> : <span className="text-gray-500">—</span>}</td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button type="button" onClick={() => mark(w, 'present')} disabled={cs === 'present'} className="rounded-xl bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-40">Present</button>
                      <button type="button" onClick={() => mark(w, 'absent')} disabled={cs === 'absent'} className="rounded-xl bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-40">Absent</button>
                    </div></td>
                  </tr>
                })}</tbody></table></div>}
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            {pendingLoading ? [1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />)
            : !pendingRequests.length ? <div className="glass-card p-8 text-center text-gray-400">No pending requests 🎉</div>
            : pendingRequests.map((r) => (
              <article key={r.id} className="glass-card flex flex-col gap-4 p-5 hover:shadow-glow md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{r.workerName}</p><p className="text-sm text-gray-500">{r.workerPhone}</p>
                  <p className="mt-1 text-sm text-gray-400">Site: {sites.find((s) => s.id === r.siteId)?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">Date: {r.date || '-'}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleAction(r, 'approved')} disabled={resolvingIds.includes(r.id)} className="rounded-xl bg-emerald-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">Approve ✓</button>
                  <button type="button" onClick={() => handleAction(r, 'rejected')} disabled={resolvingIds.includes(r.id)} className="rounded-xl bg-red-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">Reject ✗</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </DashboardLayout>
  )
}

export default AttendancePage
