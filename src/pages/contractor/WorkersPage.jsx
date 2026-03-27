// Premium contractor workers page with glassmorphism and gradient design.
import { getApp, getApps, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Modal from '../../components/common/Modal'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import { uploadQRImage } from '../../services/cloudinaryService'
import { addWorker, assignWorkerToSite, calculatePendingWages, deleteWorker, getAttendanceByWorker, getSitesByContractor, getSitesByWorker, getWorkersByContractor, removeWorkerFromSite } from '../../services/firestoreService'
import { phoneToEmail } from '../../utils/helpers'

const workerFormInitialState = { name: '', phone: '', dailyWage: '', siteIds: [], qrFile: null, password: '', confirmPassword: '' }

function WorkersPage() {
  const { contractorUser } = useAuth()
  const [searchParams] = useSearchParams()
  const preselectedSite = searchParams.get('site')
  const { toast, showToast, hideToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [workers, setWorkers] = useState([])
  const [sites, setSites] = useState([])
  const [workerSiteMap, setWorkerSiteMap] = useState({})
  const [searchText, setSearchText] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [workerForm, setWorkerForm] = useState(workerFormInitialState)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [workerMetaLoading, setWorkerMetaLoading] = useState(false)
  const [workerMeta, setWorkerMeta] = useState({ totalAttendance: 0, pendingAmount: 0 })

  const getSecondaryAuth = () => {
    const firebaseConfig = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID }
    const appName = 'worker-auth-creation'
    const app = getApps().some((item) => item.name === appName) ? getApp(appName) : initializeApp(firebaseConfig, appName)
    return getAuth(app)
  }

  const loadWorkersData = async () => {
    if (!contractorUser?.uid) return
    setIsLoading(true)
    try {
      const [workersList, sitesList] = await Promise.all([getWorkersByContractor(contractorUser.uid), getSitesByContractor(contractorUser.uid)])
      const siteMap = sitesList.reduce((acc, site) => { acc[site.id] = site.name; return acc }, {})
      const assignmentEntries = await Promise.all(workersList.map(async (worker) => { try { const assignedSites = await getSitesByWorker(worker.id); return [worker.id, { ids: assignedSites.map((a) => a.siteId), names: assignedSites.map((a) => siteMap[a.siteId]).filter(Boolean) }] } catch (error) { return [worker.id, { ids: [], names: [] }] } }))
      setWorkers(workersList); setSites(sitesList); setWorkerSiteMap(Object.fromEntries(assignmentEntries))
    } catch (error) { console.error('Failed to load workers:', error); showToast('Could not load workers', 'error') } finally { setIsLoading(false) }
  }

  useEffect(() => { loadWorkersData() }, [contractorUser?.uid])

  const filteredWorkers = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    return workers.filter((worker) => {
      const matchesSearch = query.length === 0 || String(worker.name || '').toLowerCase().includes(query) || String(worker.phone || '').toLowerCase().includes(query)
      if (!matchesSearch) return false
      if (!preselectedSite) return true
      return (workerSiteMap[worker.id]?.ids || []).includes(preselectedSite)
    })
  }, [preselectedSite, searchText, workerSiteMap, workers])

  const openAddModal = () => { setWorkerForm(workerFormInitialState); setFormError(''); setIsAddModalOpen(true) }
  const closeAddModal = () => { setIsAddModalOpen(false); setWorkerForm(workerFormInitialState); setFormError('') }

  const handleAddWorker = async (event) => {
    event.preventDefault()
    if (!contractorUser?.uid) return
    const sanitizedPhone = workerForm.phone.replace(/\D/g, '')
    if (sanitizedPhone.length !== 10) { setFormError('Phone number must be exactly 10 digits'); return }
    if (String(workerForm.password).length < 6) { setFormError('Password must be at least 6 characters'); return }
    if (workerForm.password !== workerForm.confirmPassword) { setFormError('Password and confirm password do not match'); return }
    setIsSubmitting(true); setFormError('')
    try {
      let upiQrUrl = ''
      if (workerForm.qrFile) { upiQrUrl = await uploadQRImage(workerForm.qrFile) }
      const secondaryAuth = getSecondaryAuth()
      const workerCredential = await createUserWithEmailAndPassword(secondaryAuth, phoneToEmail(sanitizedPhone), workerForm.password)
      const workerData = { name: workerForm.name.trim(), phone: sanitizedPhone, dailyWage: Number(workerForm.dailyWage), upiQrUrl, authUid: workerCredential.user.uid }
      const createdWorker = await addWorker(contractorUser.uid, workerData)
      if (workerForm.siteIds.length > 0) { await Promise.all(workerForm.siteIds.map((siteId) => assignWorkerToSite(siteId, createdWorker.id, contractorUser.uid))) }
      showToast('Worker added successfully', 'success'); closeAddModal(); await loadWorkersData()
    } catch (error) { setFormError(error?.message || 'Failed to add worker') } finally { setIsSubmitting(false) }
  }

  const handleViewWorker = async (worker) => {
    setSelectedWorker(worker); setWorkerMetaLoading(true)
    try {
      const [attendanceList, pending] = await Promise.all([getAttendanceByWorker(worker.id), calculatePendingWages(worker.id)])
      setWorkerMeta({ totalAttendance: attendanceList.length, pendingAmount: pending.pendingAmount })
    } catch (error) { showToast('Could not load worker details', 'error') } finally { setWorkerMetaLoading(false) }
  }

  const handleRemoveWorker = async (worker) => {
    if (!window.confirm(`Are you sure you want to remove ${worker.name}?`)) return
    try { const assignments = await getSitesByWorker(worker.id); await Promise.all(assignments.map((a) => removeWorkerFromSite(a.id))); await deleteWorker(worker.id); showToast('Worker removed', 'success'); await loadWorkersData() } catch (error) { showToast('Could not remove worker', 'error') }
  }

  const renderWorkerSites = (workerId) => {
    const names = workerSiteMap[workerId]?.names || []
    if (names.length === 0) return <span className="text-xs text-gray-500">No sites assigned</span>
    return names.map((name) => (<span key={`${workerId}-${name}`} className="badge-neutral text-[11px]">{name}</span>))
  }

  return (
    <DashboardLayout title="Workers">
      <div className="space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input type="text" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search by worker name or phone" className="input-field sm:max-w-md" />
          <button type="button" onClick={openAddModal} className="btn-primary px-4 py-2 text-sm">Add Worker</button>
        </section>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">{Array.from({ length: 5 }).map((_, index) => (<div key={`worker-skeleton-${index + 1}`} className="h-20 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />))}</div>
        ) : filteredWorkers.length === 0 ? (
          <div className="glass-card p-8 text-center"><p className="text-lg font-semibold text-white">No workers added yet</p><button type="button" onClick={openAddModal} className="btn-primary mt-4 px-4 py-2 text-sm">Add Worker</button></div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm lg:block">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-gray-400"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Daily Wage</th><th className="px-4 py-3">Sites Assigned</th><th className="px-4 py-3">Actions</th></tr></thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredWorkers.map((worker) => {
                    const initials = String(worker.name || 'W').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <tr key={worker.id} className="transition-colors duration-200 hover:bg-white/[0.03]">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white shadow-glow">{initials}</span><div><p className="font-medium text-white">{worker.name}</p><p className="text-xs text-gray-500">{worker.phone}</p></div></div></td>
                        <td className="px-4 py-3 text-gray-400">{worker.phone}</td>
                        <td className="px-4 py-3 text-emerald-400">₹{worker.dailyWage} / day</td>
                        <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">{renderWorkerSites(worker.id)}</div></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button type="button" onClick={() => handleViewWorker(worker)} className="text-brand-400 transition-colors duration-200 hover:text-brand-300">View</button><button type="button" onClick={() => handleRemoveWorker(worker)} className="text-red-400 transition-colors duration-200 hover:text-red-300">Remove</button></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 lg:hidden">
              {filteredWorkers.map((worker) => (
                <article key={worker.id} className="glass-card p-4">
                  <p className="text-lg font-semibold text-white">{worker.name}</p><p className="text-sm text-gray-500">{worker.phone}</p>
                  <p className="mt-2 text-emerald-400">₹{worker.dailyWage} / day</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{renderWorkerSites(worker.id)}</div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <button type="button" onClick={() => handleViewWorker(worker)} className="text-brand-400 hover:text-brand-300">View</button>
                    <button type="button" onClick={() => handleRemoveWorker(worker)} className="text-red-400 hover:text-red-300">Remove</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add Worker">
        <form onSubmit={handleAddWorker} className="space-y-4">
          <div><label htmlFor="worker-name" className="mb-2 block text-sm text-gray-300">Full Name</label><input id="worker-name" type="text" required value={workerForm.name} onChange={(e) => setWorkerForm((prev) => ({ ...prev, name: e.target.value }))} className="input-field" /></div>
          <div><label htmlFor="worker-phone" className="mb-2 block text-sm text-gray-300">Phone Number</label><input id="worker-phone" type="text" required value={workerForm.phone} onChange={(e) => setWorkerForm((prev) => ({ ...prev, phone: e.target.value }))} className="input-field" /></div>
          <div><label htmlFor="worker-wage" className="mb-2 block text-sm text-gray-300">Daily Wage in ₹</label><input id="worker-wage" type="number" min="1" required value={workerForm.dailyWage} onChange={(e) => setWorkerForm((prev) => ({ ...prev, dailyWage: e.target.value }))} className="input-field" /></div>
          <div><label className="mb-2 block text-sm text-gray-300">Assign to Sites</label><select multiple value={workerForm.siteIds} onChange={(e) => { const v = Array.from(e.target.selectedOptions).map((o) => o.value); setWorkerForm((prev) => ({ ...prev, siteIds: v })) }} className="select-field h-32 text-sm">{sites.length === 0 ? <option disabled value="">Create a site first.</option> : sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><p className="mt-1.5 text-xs text-gray-500">Hold Ctrl to select multiple.</p></div>
          <div><label htmlFor="worker-qr" className="mb-2 block text-sm text-gray-300">UPI QR Code Image</label><input id="worker-qr" type="file" accept="image/*" onChange={(e) => setWorkerForm((prev) => ({ ...prev, qrFile: e.target.files?.[0] || null }))} className="input-field text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1 file:text-brand-400" /></div>
          <div><label htmlFor="worker-password" className="mb-2 block text-sm text-gray-300">Password</label><input id="worker-password" type="password" required minLength={6} value={workerForm.password} onChange={(e) => setWorkerForm((prev) => ({ ...prev, password: e.target.value }))} className="input-field" /></div>
          <div><label htmlFor="worker-confirm-password" className="mb-2 block text-sm text-gray-300">Confirm Password</label><input id="worker-confirm-password" type="password" required value={workerForm.confirmPassword} onChange={(e) => setWorkerForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} className="input-field" /></div>
          {formError ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div> : null}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={closeAddModal} className="btn-secondary px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-2 text-sm">{isSubmitting ? 'Adding...' : 'Add Worker'}</button></div>
        </form>
      </Modal>
      <Modal isOpen={Boolean(selectedWorker)} onClose={() => setSelectedWorker(null)} title={selectedWorker ? selectedWorker.name : 'Worker Details'}>
        {selectedWorker ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-gray-500">Phone</p><p className="mt-1 font-medium text-white">{selectedWorker.phone}</p></div><div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-gray-500">Daily Wage</p><p className="mt-1 font-medium text-emerald-400">₹{selectedWorker.dailyWage}</p></div></div>
            <div><p className="mb-2 text-gray-400">Assigned Sites:</p><div className="flex flex-wrap gap-1.5">{renderWorkerSites(selectedWorker.id)}</div></div>
            {selectedWorker.upiQrUrl ? <img src={selectedWorker.upiQrUrl} alt="Worker UPI QR" className="mx-auto mt-2 max-h-56 rounded-xl border border-white/10" /> : <p className="text-gray-500">No UPI QR image uploaded.</p>}
            {workerMetaLoading ? <p className="text-gray-400">Loading financial details...</p> : (
              <div className="rounded-xl bg-white/[0.04] p-4"><div className="flex justify-between"><span className="text-gray-400">Total Attendance</span><span className="font-medium text-white">{workerMeta.totalAttendance}</span></div><div className="mt-2 flex justify-between"><span className="text-gray-400">Pending Wages</span><span className="font-bold text-brand-400">₹{workerMeta.pendingAmount}</span></div></div>
            )}
            <div className="pt-2"><button type="button" onClick={() => setSelectedWorker(null)} className="btn-secondary px-4 py-2 text-sm">Close</button></div>
          </div>
        ) : null}
      </Modal>
      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </DashboardLayout>
  )
}

export default WorkersPage
