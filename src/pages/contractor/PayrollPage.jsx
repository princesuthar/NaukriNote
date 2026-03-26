// Contractor payroll page with pending wage insights, payments, and history.
import { Fragment, useEffect, useMemo, useState } from 'react'
import Modal from '../../components/common/Modal'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import {
  addPayment,
  calculatePendingWages,
  getAttendanceByWorker,
  getPaymentsByWorker,
  getSitesByContractor,
  getSitesByWorker,
  getWorkersByContractor,
} from '../../services/firestoreService'
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
    if (!contractorUser?.uid) {
      return
    }

    setIsLoading(true)
    try {
      const [workersList, sitesList] = await Promise.all([
        getWorkersByContractor(contractorUser.uid),
        getSitesByContractor(contractorUser.uid),
      ])

      const siteMap = sitesList.reduce((acc, site) => {
        acc[site.id] = site.name
        return acc
      }, {})

      const results = await Promise.all(
        workersList.map(async (worker) => {
          const [pendingData, attendance, payments, assignments] = await Promise.all([
            calculatePendingWages(worker.id),
            getAttendanceByWorker(worker.id),
            getPaymentsByWorker(worker.id),
            getSitesByWorker(worker.id),
          ])

          const sortedPayments = [...payments].sort((a, b) => {
            const aTime = a.paidAt?.seconds || 0
            const bTime = b.paidAt?.seconds || 0
            return bTime - aTime
          })

          return {
            workerId: worker.id,
            pendingData,
            attendanceCount: attendance.filter((entry) => entry.status === 'present').length,
            payments: sortedPayments,
            siteIds: assignments.map((item) => item.siteId),
            siteNames: assignments.map((item) => siteMap[item.siteId]).filter(Boolean),
          }
        }),
      )

      const nextPayrollMap = {}
      const nextPaymentHistoryMap = {}
      const nextWorkerSiteMap = {}

      results.forEach((item) => {
        nextPayrollMap[item.workerId] = {
          ...item.pendingData,
          attendanceCount: item.attendanceCount,
        }
        nextPaymentHistoryMap[item.workerId] = item.payments
        nextWorkerSiteMap[item.workerId] = {
          ids: item.siteIds,
          names: item.siteNames,
        }
      })

      setWorkers(workersList)
      setSites(sitesList)
      setPayrollMap(nextPayrollMap)
      setPaymentHistoryMap(nextPaymentHistoryMap)
      setWorkerSiteMap(nextWorkerSiteMap)
    } catch (error) {
      console.error('Failed to load payroll:', error)
      showToast('Could not load payroll data', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPayrollData()
  }, [contractorUser?.uid])

  const filteredWorkers = useMemo(() => {
    if (siteFilter === 'all') {
      return workers
    }

    return workers.filter((worker) => (workerSiteMap[worker.id]?.ids || []).includes(siteFilter))
  }, [siteFilter, workerSiteMap, workers])

  const summary = useMemo(() => {
    let totalPending = 0
    let totalPaidThisMonth = 0
    let workersWithPending = 0
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    workers.forEach((worker) => {
      const payroll = payrollMap[worker.id]
      if (!payroll) {
        return
      }

      totalPending += Number(payroll.pendingAmount || 0)
      if (payroll.pendingAmount > 0) {
        workersWithPending += 1
      }

      const workerPayments = paymentHistoryMap[worker.id] || []
      workerPayments.forEach((payment) => {
        if (!payment.paidAt?.seconds) {
          return
        }
        const paidDate = new Date(payment.paidAt.seconds * 1000)
        if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
          totalPaidThisMonth += Number(payment.amount || 0)
        }
      })
    })

    return {
      totalPending,
      totalPaidThisMonth,
      workersWithPending,
    }
  }, [paymentHistoryMap, payrollMap, workers])

  const openPayModal = (worker) => {
    const pendingAmount = Number(payrollMap[worker.id]?.pendingAmount || 0)
    setSelectedWorker(worker)
    setAmountToPay(String(pendingAmount))
    setPaymentNote('')
  }

  const closePayModal = () => {
    setSelectedWorker(null)
    setAmountToPay('0')
    setPaymentNote('')
  }

  const handleMarkPaid = async (event) => {
    event.preventDefault()
    if (!selectedWorker || !contractorUser?.uid) {
      return
    }

    const amount = Number(amountToPay)
    if (!amount || amount <= 0) {
      showToast('Enter a valid amount', 'error')
      return
    }

    setIsPaying(true)
    try {
      await addPayment({
        contractorId: contractorUser.uid,
        workerId: selectedWorker.id,
        amount,
        note: paymentNote.trim(),
      })

      showToast('Payment marked successfully', 'success')
      closePayModal()
      await loadPayrollData()
    } catch (error) {
      console.error('Failed to add payment:', error)
      showToast('Could not save payment', 'error')
    } finally {
      setIsPaying(false)
    }
  }

  const stats = [
    {
      label: 'Total Pending Wages',
      value: formatCurrency(summary.totalPending),
      valueClass: 'text-orange-400',
    },
    {
      label: 'Total Paid This Month',
      value: formatCurrency(summary.totalPaidThisMonth),
      valueClass: 'text-emerald-400',
    },
    {
      label: 'Workers with Pending Dues',
      value: summary.workersWithPending,
      valueClass: 'text-white',
    },
  ]

  return (
    <DashboardLayout title="Payroll">
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-xl border border-gray-700 bg-gray-800 p-4">
              <p className={`text-2xl font-bold ${stat.valueClass}`}>{stat.value}</p>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-700 bg-gray-800">
          <div className="flex flex-col gap-3 border-b border-gray-700 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-white">Worker Payroll</h3>
            <select
              value={siteFilter}
              onChange={(event) => setSiteFilter(event.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="all">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`payroll-skeleton-${index + 1}`}
                  className="h-14 animate-pulse rounded-lg bg-gray-700/70"
                />
              ))}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No workers found for the selected site.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-900/60 text-left uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Daily Wage</th>
                    <th className="px-4 py-3">Days Present</th>
                    <th className="px-4 py-3">Total Earned</th>
                    <th className="px-4 py-3">Total Paid</th>
                    <th className="px-4 py-3">Pending</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredWorkers.map((worker) => {
                    const payroll = payrollMap[worker.id] || {
                      attendanceCount: 0,
                      totalEarned: 0,
                      totalPaid: 0,
                      pendingAmount: 0,
                    }

                    return (
                      <Fragment key={worker.id}>
                        <tr>
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{worker.name}</p>
                            <p className="text-xs text-gray-400">{worker.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-300">₹{worker.dailyWage}</td>
                          <td className="px-4 py-3 text-white">{payroll.attendanceCount}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(payroll.totalEarned)}</td>
                          <td className="px-4 py-3 text-green-400">{formatCurrency(payroll.totalPaid)}</td>
                          <td className="px-4 py-3 font-bold text-orange-400">
                            {formatCurrency(payroll.pendingAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-3">
                              {payroll.pendingAmount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => openPayModal(worker)}
                                  className="rounded-lg bg-orange-500 px-3 py-1 text-sm font-semibold text-white transition hover:bg-orange-600"
                                >
                                  Pay Now
                                </button>
                              ) : (
                                <span className="text-xs text-gray-500">Settled</span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedWorkerId((prev) => (prev === worker.id ? '' : worker.id))
                                }
                                className="text-xs text-gray-300 transition hover:text-white"
                              >
                                {expandedWorkerId === worker.id ? 'Hide History' : 'Show History'}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expandedWorkerId === worker.id ? (
                          <tr>
                            <td colSpan={7} className="bg-gray-900/30 px-4 py-3">
                              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">
                                Payment History
                              </p>
                              <div className="space-y-2">
                                {(paymentHistoryMap[worker.id] || []).length === 0 ? (
                                  <p className="text-xs text-gray-500">No payments recorded yet.</p>
                                ) : (
                                  (paymentHistoryMap[worker.id] || []).map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="flex flex-col gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                      <span>
                                        {payment.paidAt?.seconds
                                          ? new Date(payment.paidAt.seconds * 1000).toLocaleString('en-IN')
                                          : 'Date unavailable'}
                                      </span>
                                      <span className="font-semibold text-green-400">
                                        {formatCurrency(payment.amount)}
                                      </span>
                                      <span className="text-gray-400">{payment.note || '-'}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedWorker)}
        onClose={closePayModal}
        title={selectedWorker ? `Pay ${selectedWorker.name}` : 'Pay Worker'}
      >
        {selectedWorker ? (
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <p className="text-sm text-gray-300">Worker: {selectedWorker.name}</p>
            <p className="text-lg font-bold text-orange-400">
              Pending: {formatCurrency(payrollMap[selectedWorker.id]?.pendingAmount || 0)}
            </p>

            {selectedWorker.upiQrUrl ? (
              <img
                src={selectedWorker.upiQrUrl}
                alt="Worker UPI QR"
                className="mx-auto max-h-60 rounded-lg border border-gray-700"
              />
            ) : (
              <p className="text-sm text-gray-500">UPI QR code not available.</p>
            )}

            <div>
              <label htmlFor="payment-amount" className="mb-1 block text-sm text-gray-300">
                Amount
              </label>
              <input
                id="payment-amount"
                type="number"
                min="1"
                value={amountToPay}
                onChange={(event) => setAmountToPay(event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="payment-note" className="mb-1 block text-sm text-gray-300">
                Note (Optional)
              </label>
              <input
                id="payment-note"
                type="text"
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closePayModal}
                className="rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPaying}
                className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPaying ? 'Saving...' : 'Mark as Paid'}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </DashboardLayout>
  )
}

export default PayrollPage
