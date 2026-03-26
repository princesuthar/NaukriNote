// Premium payroll page with glassmorphism design and gradient accents.
import { Fragment, useEffect, useMemo, useState } from 'react'
import Modal from '../../components/common/Modal'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import { addPayment, calculatePendingWages, getAttendanceByWorker, getPaymentsByWorker, getSitesByContractor, getSitesByWorker, getWorkersByContractor } from '../../services/firestoreService'
import { formatCurrency } from '../../utils/helpers'

function PayrollPage() {
  const { contractorUser } = useAuth()
  const { toast, showToast, hideToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [sites, setSites] = useState([])
  const [workers, setWorkers] = useState([])
  const [siteFilter, setSiteFilter] = useState('all')
  const [payrollMap, setPayrollMap] = useState({})
  const [paymentHistoryMap, setPaymentHistoryMap] = useState({})
  const [workerSiteMap, setWorkerSiteMap] = useState({})
  const [expandedWorkerId, setExpandedWorkerId] = useState('')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [amountToPay, setAmountToPay] = useState('0')
  const [paymentNote, setPaymentNote] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  const loadPayrollData = async () => {
    if (!contractorUser?.uid) return
    setIsLoading(true)
    try {
      const [workersList, sitesList] = await Promise.all([getWorkersByContractor(contractorUser.uid), getSitesByContractor(contractorUser.uid)])
      const siteMap = sitesList.reduce((acc, site) => { acc[site.id] = site.name; return acc }, {})
      const results = await Promise.all(workersList.map(async (worker) => {
        const [pendingData, attendance, payments, assignments] = await Promise.all([calculatePendingWages(worker.id), getAttendanceByWorker(worker.id), getPaymentsByWorker(worker.id), getSitesByWorker(worker.id)])
        const sortedPayments = [...payments].sort((a, b) => (b.paidAt?.seconds || 0) - (a.paidAt?.seconds || 0))
        return { workerId: worker.id, pendingData, attendanceCount: attendance.filter((e) => e.status === 'present').length, payments: sortedPayments, siteIds: assignments.map((i) => i.siteId), siteNames: assignments.map((i) => siteMap[i.siteId]).filter(Boolean) }
      }))
      const nP = {}, nH = {}, nS = {}
      results.forEach((i) => { nP[i.workerId] = { ...i.pendingData, attendanceCount: i.attendanceCount }; nH[i.workerId] = i.payments; nS[i.workerId] = { ids: i.siteIds, names: i.siteNames } })
      setWorkers(workersList); setSites(sitesList); setPayrollMap(nP); setPaymentHistoryMap(nH); setWorkerSiteMap(nS)
    } catch (error) { showToast('Could not load payroll data', 'error') } finally { setIsLoading(false) }
  }

  useEffect(() => { loadPayrollData() }, [contractorUser?.uid])
  const filteredWorkers = useMemo(() => siteFilter === 'all' ? workers : workers.filter((w) => (workerSiteMap[w.id]?.ids || []).includes(siteFilter)), [siteFilter, workerSiteMap, workers])

  const summary = useMemo(() => {
    let totalPending = 0, totalPaidThisMonth = 0, workersWithPending = 0
    const now = new Date(), cm = now.getMonth(), cy = now.getFullYear()
    workers.forEach((w) => { const p = payrollMap[w.id]; if (!p) return; totalPending += Number(p.pendingAmount || 0); if (p.pendingAmount > 0) workersWithPending += 1; (paymentHistoryMap[w.id] || []).forEach((pay) => { if (!pay.paidAt?.seconds) return; const d = new Date(pay.paidAt.seconds * 1000); if (d.getMonth() === cm && d.getFullYear() === cy) totalPaidThisMonth += Number(pay.amount || 0) }) })
    return { totalPending, totalPaidThisMonth, workersWithPending }
  }, [paymentHistoryMap, payrollMap, workers])

  const openPayModal = (w) => { setSelectedWorker(w); setAmountToPay(String(Number(payrollMap[w.id]?.pendingAmount || 0))); setPaymentNote('') }
  const closePayModal = () => { setSelectedWorker(null); setAmountToPay('0'); setPaymentNote('') }

  const handleMarkPaid = async (event) => {
    event.preventDefault()
    if (!selectedWorker || !contractorUser?.uid) return
    const amount = Number(amountToPay)
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return }
    setIsPaying(true)
    try { await addPayment({ contractorId: contractorUser.uid, workerId: selectedWorker.id, amount, note: paymentNote.trim() }); showToast('Payment marked successfully', 'success'); closePayModal(); await loadPayrollData() } catch (error) { showToast('Could not save payment', 'error') } finally { setIsPaying(false) }
  }

  const stats = [
    { label: 'Total Pending Wages', value: formatCurrency(summary.totalPending), valueClass: 'text-brand-400' },
    { label: 'Paid This Month', value: formatCurrency(summary.totalPaidThisMonth), valueClass: 'text-emerald-400' },
    { label: 'Workers with Dues', value: summary.workersWithPending, valueClass: 'text-white' },
  ]

  return (
    <DashboardLayout title="Payroll">
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">{stats.map((s) => (<article key={s.label} className="glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"><p className={`text-2xl font-bold ${s.valueClass}`}>{s.value}</p><p className="mt-2 text-sm text-gray-400">{s.label}</p></article>))}</section>
        <section className="glass-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-white">Worker Payroll</h3>
            <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="select-field w-auto text-sm"><option value="all">All Sites</option>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </div>
          {isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <div key={`ps-${i}`} className="h-14 animate-pulse rounded-lg bg-white/[0.04]" />)}</div>
          : filteredWorkers.length === 0 ? <p className="p-6 text-sm text-gray-400">No workers found for the selected site.</p>
          : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="bg-white/[0.03] text-left uppercase tracking-wider text-gray-400"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Daily Wage</th><th className="px-4 py-3">Days Present</th><th className="px-4 py-3">Total Earned</th><th className="px-4 py-3">Total Paid</th><th className="px-4 py-3">Pending</th><th className="px-4 py-3">Action</th></tr></thead>
                <tbody className="divide-y divide-white/5">{filteredWorkers.map((worker) => {
                  const payroll = payrollMap[worker.id] || { attendanceCount: 0, totalEarned: 0, totalPaid: 0, pendingAmount: 0 }
                  return (<Fragment key={worker.id}>
                    <tr className="transition-colors duration-200 hover:bg-white/[0.03]">
                      <td className="px-4 py-3"><p className="font-medium text-white">{worker.name}</p><p className="text-xs text-gray-500">{worker.phone}</p></td>
                      <td className="px-4 py-3 text-gray-400">₹{worker.dailyWage}</td><td className="px-4 py-3 text-white">{payroll.attendanceCount}</td>
                      <td className="px-4 py-3 text-gray-300">{formatCurrency(payroll.totalEarned)}</td><td className="px-4 py-3 text-emerald-400">{formatCurrency(payroll.totalPaid)}</td>
                      <td className="px-4 py-3 font-bold text-brand-400">{formatCurrency(payroll.pendingAmount)}</td>
                      <td className="px-4 py-3"><div className="flex flex-wrap items-center gap-3">
                        {payroll.pendingAmount > 0 ? <button type="button" onClick={() => openPayModal(worker)} className="btn-primary px-3 py-1 text-xs">Pay Now</button> : <span className="badge-success text-[11px]">Settled</span>}
                        <button type="button" onClick={() => setExpandedWorkerId((prev) => prev === worker.id ? '' : worker.id)} className="text-xs text-gray-400 hover:text-white">{expandedWorkerId === worker.id ? 'Hide History' : 'Show History'}</button>
                      </div></td>
                    </tr>
                    {expandedWorkerId === worker.id ? <tr><td colSpan={7} className="bg-white/[0.02] px-4 py-3"><p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Payment History</p><div className="space-y-2">{(paymentHistoryMap[worker.id] || []).length === 0 ? <p className="text-xs text-gray-500">No payments recorded yet.</p> : (paymentHistoryMap[worker.id] || []).map((payment) => (<div key={payment.id} className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between"><span>{payment.paidAt?.seconds ? new Date(payment.paidAt.seconds * 1000).toLocaleString('en-IN') : 'Date unavailable'}</span><span className="font-semibold text-emerald-400">{formatCurrency(payment.amount)}</span><span className="text-gray-500">{payment.note || '-'}</span></div>))}</div></td></tr> : null}
                  </Fragment>)
                })}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <Modal isOpen={Boolean(selectedWorker)} onClose={closePayModal} title={selectedWorker ? `Pay ${selectedWorker.name}` : 'Pay Worker'}>
        {selectedWorker ? (
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <p className="text-sm text-gray-400">Worker: {selectedWorker.name}</p>
            <p className="text-lg font-bold text-brand-400">Pending: {formatCurrency(payrollMap[selectedWorker.id]?.pendingAmount || 0)}</p>
            {selectedWorker.upiQrUrl ? <img src={selectedWorker.upiQrUrl} alt="Worker UPI QR" className="mx-auto max-h-60 rounded-xl border border-white/10" /> : <p className="text-sm text-gray-500">UPI QR code not available.</p>}
            <div><label htmlFor="payment-amount" className="mb-2 block text-sm text-gray-300">Amount</label><input id="payment-amount" type="number" min="1" value={amountToPay} onChange={(e) => setAmountToPay(e.target.value)} className="input-field" /></div>
            <div><label htmlFor="payment-note" className="mb-2 block text-sm text-gray-300">Note (Optional)</label><input id="payment-note" type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="input-field" /></div>
            <div className="flex justify-end gap-3"><button type="button" onClick={closePayModal} className="btn-secondary px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={isPaying} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{isPaying ? 'Saving...' : 'Mark as Paid'}</button></div>
          </form>
        ) : null}
      </Modal>
      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </DashboardLayout>
  )
}

export default PayrollPage
