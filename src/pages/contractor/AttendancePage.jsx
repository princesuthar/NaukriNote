// Contractor attendance page with marking controls and realtime request approvals.
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../firebase/firebaseConfig'
import useToast from '../../hooks/useToast'
import {
  getAttendanceByDate,
  getSitesByContractor,
  getWorkerById,
  getWorkersBySite,
  markAttendance,
  updateRequestStatus,
} from '../../services/firestoreService'
import { getTodayString } from '../../utils/helpers'

const TAB_MARK = 'mark'
const TAB_PENDING = 'pending'

function AttendancePage() {
  const { contractorUser } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  const [activeTab, setActiveTab] = useState(TAB_MARK)
  const [sites, setSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  const [workers, setWorkers] = useState([])
  const [statusMap, setStatusMap] = useState({})
  const [loadingWorkers, setLoadingWorkers] = useState(false)

  const [pendingRequests, setPendingRequests] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [resolvingRequestIds, setResolvingRequestIds] = useState([])

  useEffect(() => {
    const loadSites = async () => {
      if (!contractorUser?.uid) {
        return
      }

      try {
        const sitesList = await getSitesByContractor(contractorUser.uid)
        setSites(sitesList)
        if (sitesList.length > 0) {
          setSelectedSiteId((prev) => prev || sitesList[0].id)
        }
      } catch (error) {
        console.error('Failed to load sites:', error)
        showToast('Could not load sites', 'error')
      }
    }

    loadSites()
  }, [contractorUser?.uid])

  useEffect(() => {
    if (!contractorUser?.uid) {
      return undefined
    }

    setPendingLoading(true)
    const pendingQuery = query(
      collection(db, 'attendance_requests'),
      where('contractorId', '==', contractorUser.uid),
      where('status', '==', 'pending'),
    )

    const unsubscribe = onSnapshot(
      pendingQuery,
      async (snapshot) => {
        try {
          const requests = await Promise.all(
            snapshot.docs.map(async (requestDoc) => {
              const data = requestDoc.data()
              let worker = null

              try {
                worker = await getWorkerById(data.workerId)
              } catch (error) {
                console.error('Failed to load worker for request:', error)
              }

              return {
                id: requestDoc.id,
                ...data,
                workerName: worker?.name || 'Worker',
                workerPhone: worker?.phone || '-',
              }
            }),
          )

          requests.sort((a, b) => {
            const aValue = a.requestedAt?.seconds || 0
            const bValue = b.requestedAt?.seconds || 0
            return bValue - aValue
          })

          setPendingRequests(requests)
        } finally {
          setPendingLoading(false)
        }
      },
      (error) => {
        console.error('Pending requests snapshot failed:', error)
        setPendingLoading(false)
        showToast('Failed to subscribe to pending requests', 'error')
      },
    )

    return () => unsubscribe()
  }, [contractorUser?.uid])

  const loadWorkersForSelection = async () => {
    console.log('handleLoadWorkers called with selectedSiteId:', selectedSiteId, 'selectedDate:', selectedDate)
    
    if (!selectedSiteId) {
      alert('Please select a site')
      console.warn('No site selected')
      return
    }
    
    if (!selectedDate) {
      alert('Please select a date')
      console.warn('No date selected')
      return
    }

    setLoadingWorkers(true)
    try {
      console.log('Fetching workers for siteId:', selectedSiteId)
      const workers = await getWorkersBySite(selectedSiteId)
      console.log('Fetched workers:', workers)

      if (!workers || workers.length === 0) {
        console.warn('No workers assigned to this site')
        showToast('No workers assigned to this site', 'info')
        setWorkers([])
        setStatusMap({})
        setLoadingWorkers(false)
        return
      }

      console.log(`Fetching attendance for siteId: ${selectedSiteId}, date: ${selectedDate}`)
      const attendanceList = await getAttendanceByDate(selectedSiteId, selectedDate)
      console.log('Fetched attendance records:', attendanceList)

      const statusLookup = attendanceList.reduce((acc, entry) => {
        acc[entry.workerId] = entry.status
        return acc
      }, {})
      console.log('Status lookup map:', statusLookup)

      console.log('Setting workers state with', workers.length, 'workers')
      setWorkers(workers)
      setStatusMap(statusLookup)
      showToast(`Loaded ${workers.length} workers`, 'success')
    } catch (error) {
      console.error('Failed to load attendance workers:', error)
      showToast('Could not load workers for attendance', 'error')
    } finally {
      setLoadingWorkers(false)
    }
  }

  const selectedSiteName = useMemo(
    () => sites.find((site) => site.id === selectedSiteId)?.name || 'Selected Site',
    [selectedSiteId, sites],
  )

  const markWorkerAttendance = async (worker, status) => {
    const previousStatus = statusMap[worker.id]
    if (previousStatus === status) {
      return
    }

    setStatusMap((prev) => ({ ...prev, [worker.id]: status }))

    try {
      await markAttendance({
        contractorId: contractorUser.uid,
        workerId: worker.id,
        siteId: selectedSiteId,
        date: selectedDate,
        status,
      })
      showToast('Attendance marked', 'success')
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      setStatusMap((prev) => ({ ...prev, [worker.id]: previousStatus }))
      showToast('Failed to mark attendance', 'error')
    }
  }

  const getRequestedAgo = (timestamp) => {
    if (!timestamp?.seconds) {
      return 'Requested recently'
    }

    const diffMs = Date.now() - timestamp.seconds * 1000
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)))
    return `Requested ${minutes} mins ago`
  }

  const handleRequestAction = async (request, action) => {
    setResolvingRequestIds((prev) => [...prev, request.id])

    try {
      await updateRequestStatus(request.id, action)

      if (action === 'approved') {
        await markAttendance({
          contractorId: request.contractorId,
          workerId: request.workerId,
          siteId: request.siteId,
          date: request.date,
          status: 'present',
          source: 'request',
        })
      }

      showToast(
        action === 'approved' ? 'Request approved and attendance marked' : 'Request rejected',
        'success',
      )
    } catch (error) {
      console.error('Failed to process request:', error)
      showToast('Could not process request', 'error')
    } finally {
      setResolvingRequestIds((prev) => prev.filter((id) => id !== request.id))
    }
  }

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-6">
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_MARK)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === TAB_MARK
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            Mark Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_PENDING)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === TAB_PENDING
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 ? (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                {pendingRequests.length}
              </span>
            ) : null}
          </button>
        </section>

        {activeTab === TAB_MARK ? (
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 md:grid-cols-[1fr_200px_auto]">
              <select
                value={selectedSiteId}
                onChange={(event) => setSelectedSiteId(event.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
              />

              <button
                type="button"
                onClick={loadWorkersForSelection}
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
              >
                Load Workers
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
              <div className="border-b border-gray-700 px-4 py-3 text-sm text-gray-300">
                {selectedSiteName} - {selectedDate}
              </div>

              {loadingWorkers ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`attendance-skeleton-${index + 1}`}
                      className="h-12 animate-pulse rounded-lg bg-gray-700/70"
                    />
                  ))}
                </div>
              ) : workers.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">Load workers to begin attendance marking.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700 text-sm">
                    <thead className="bg-gray-900/60 text-left uppercase tracking-wide text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Worker Name</th>
                        <th className="px-4 py-3">Daily Wage</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {workers.map((worker) => {
                        const currentStatus = statusMap[worker.id]
                        return (
                          <tr key={worker.id}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-white">{worker.name}</p>
                              <p className="text-xs text-gray-400">{worker.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-green-400">₹{worker.dailyWage}</td>
                            <td className="px-4 py-3">
                              {currentStatus === 'present' ? (
                                <span className="rounded-full bg-emerald-600/20 px-2 py-1 text-xs text-emerald-300">
                                  Present ✓
                                </span>
                              ) : currentStatus === 'absent' ? (
                                <span className="rounded-full bg-red-600/20 px-2 py-1 text-xs text-red-300">
                                  Absent ✗
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => markWorkerAttendance(worker, 'present')}
                                  disabled={currentStatus === 'present'}
                                  className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => markWorkerAttendance(worker, 'absent')}
                                  disabled={currentStatus === 'absent'}
                                  className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            {pendingLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`request-skeleton-${index + 1}`}
                    className="h-24 animate-pulse rounded-xl border border-gray-700 bg-gray-800"
                  />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400">
                No pending requests 🎉
              </div>
            ) : (
              pendingRequests.map((request) => {
                const isResolving = resolvingRequestIds.includes(request.id)

                return (
                  <article
                    key={request.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-700 bg-gray-800 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{request.workerName}</p>
                      <p className="text-sm text-gray-400">{request.workerPhone}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        Site: {sites.find((site) => site.id === request.siteId)?.name || 'Unknown Site'}
                      </p>
                      <p className="text-sm text-gray-400">Date: {request.date || '-'}</p>
                      <p className="text-xs text-gray-500">{getRequestedAgo(request.requestedAt)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRequestAction(request, 'approved')}
                        disabled={isResolving}
                        className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestAction(request, 'rejected')}
                        disabled={isResolving}
                        className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject ✗
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </section>
        )}
      </div>

      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </DashboardLayout>
  )
}

export default AttendancePage
