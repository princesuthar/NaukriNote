// Contractor workers page with search, onboarding, assignment, and profile detail workflows.
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
import {
  addWorker,
  assignWorkerToSite,
  calculatePendingWages,
  deleteWorker,
  getAttendanceByWorker,
  getSitesByContractor,
  getSitesByWorker,
  getWorkersByContractor,
  removeWorkerFromSite,
} from '../../services/firestoreService'
import { phoneToEmail } from '../../utils/helpers'

const workerFormInitialState = {
  name: '',
  phone: '',
  dailyWage: '',
  siteIds: [],
  qrFile: null,
  password: '',
  confirmPassword: '',
}

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
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

    const appName = 'worker-auth-creation'
    const app = getApps().some((item) => item.name === appName)
      ? getApp(appName)
      : initializeApp(firebaseConfig, appName)

    return getAuth(app)
  }

  const loadWorkersData = async () => {
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

      const assignmentEntries = await Promise.all(
        workersList.map(async (worker) => {
          try {
            const assignedSites = await getSitesByWorker(worker.id)
            const siteIds = assignedSites.map((assignment) => assignment.siteId)
            const names = assignedSites
              .map((assignment) => siteMap[assignment.siteId])
              .filter(Boolean)
            return [worker.id, { ids: siteIds, names }]
          } catch (error) {
            console.error('Failed to load worker assignments:', error)
            return [worker.id, { ids: [], names: [] }]
          }
        }),
      )

      setWorkers(workersList)
      setSites(sitesList)
      setWorkerSiteMap(Object.fromEntries(assignmentEntries))
    } catch (error) {
      console.error('Failed to load workers:', error)
      showToast('Could not load workers', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWorkersData()
  }, [contractorUser?.uid])

  const filteredWorkers = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return workers.filter((worker) => {
      const matchesSearch =
        query.length === 0 ||
        String(worker.name || '')
          .toLowerCase()
          .includes(query) ||
        String(worker.phone || '')
          .toLowerCase()
          .includes(query)

      if (!matchesSearch) {
        return false
      }

      if (!preselectedSite) {
        return true
      }

      return (workerSiteMap[worker.id]?.ids || []).includes(preselectedSite)
    })
  }, [preselectedSite, searchText, workerSiteMap, workers])

  const openAddModal = () => {
    setWorkerForm(workerFormInitialState)
    setFormError('')
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setWorkerForm(workerFormInitialState)
    setFormError('')
  }

  const handleAddWorker = async (event) => {
    event.preventDefault()

    if (!contractorUser?.uid) {
      return
    }

    const sanitizedPhone = workerForm.phone.replace(/\D/g, '')

    if (sanitizedPhone.length !== 10) {
      setFormError('Phone number must be exactly 10 digits')
      return
    }

    if (String(workerForm.password).length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    if (workerForm.password !== workerForm.confirmPassword) {
      setFormError('Password and confirm password do not match')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      let upiQrUrl = ''
      if (workerForm.qrFile) {
        upiQrUrl = await uploadQRImage(workerForm.qrFile)
      }

      const secondaryAuth = getSecondaryAuth()
      const workerCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        phoneToEmail(sanitizedPhone),
        workerForm.password,
      )

      const workerData = {
        name: workerForm.name.trim(),
        phone: sanitizedPhone,
        dailyWage: Number(workerForm.dailyWage),
        upiQrUrl,
        authUid: workerCredential.user.uid,
      }

      const createdWorker = await addWorker(contractorUser.uid, workerData)

      if (workerForm.siteIds.length > 0) {
        await Promise.all(
          workerForm.siteIds.map((siteId) => assignWorkerToSite(siteId, createdWorker.id, contractorUser.uid)),
        )
      }

      showToast('Worker added successfully', 'success')
      closeAddModal()
      await loadWorkersData()
    } catch (error) {
      console.error('Failed to add worker:', error)
      setFormError(error?.message || 'Failed to add worker')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewWorker = async (worker) => {
    setSelectedWorker(worker)
    setWorkerMetaLoading(true)

    try {
      const [attendanceList, pending] = await Promise.all([
        getAttendanceByWorker(worker.id),
        calculatePendingWages(worker.id),
      ])

      setWorkerMeta({
        totalAttendance: attendanceList.length,
        pendingAmount: pending.pendingAmount,
      })
    } catch (error) {
      console.error('Failed to load worker details:', error)
      showToast('Could not load worker details', 'error')
    } finally {
      setWorkerMetaLoading(false)
    }
  }

  const handleRemoveWorker = async (worker) => {
    const shouldDelete = window.confirm(`Are you sure you want to remove ${worker.name}?`)
    if (!shouldDelete) {
      return
    }

    try {
      const assignments = await getSitesByWorker(worker.id)
      await Promise.all(assignments.map((assignment) => removeWorkerFromSite(assignment.id)))
      await deleteWorker(worker.id)
      showToast('Worker removed', 'success')
      await loadWorkersData()
    } catch (error) {
      console.error('Failed to remove worker:', error)
      showToast('Could not remove worker', 'error')
    }
  }

  const renderWorkerSites = (workerId) => {
    const names = workerSiteMap[workerId]?.names || []

    if (names.length === 0) {
      return <span className="text-xs text-gray-500">No sites assigned</span>
    }

    return names.map((name) => (
      <span key={`${workerId}-${name}`} className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
        {name}
      </span>
    ))
  }

  return (
    <DashboardLayout title="Workers">
      <div className="space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by worker name or phone"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white outline-none placeholder:text-gray-500 focus:border-orange-500 sm:max-w-md"
          />
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
          >
            Add Worker
          </button>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`worker-skeleton-${index + 1}`}
                className="h-20 animate-pulse rounded-xl border border-gray-700 bg-gray-800"
              />
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center">
            <p className="text-lg font-semibold text-white">No workers added yet</p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
            >
              Add Worker
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 lg:block">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/60 text-left text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Daily Wage</th>
                    <th className="px-4 py-3">Sites Assigned</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-sm">
                  {filteredWorkers.map((worker) => {
                    const initials = String(worker.name || 'W')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <tr key={worker.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                              {initials}
                            </span>
                            <div>
                              <p className="font-medium text-white">{worker.name}</p>
                              <p className="text-xs text-gray-400">{worker.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{worker.phone}</td>
                        <td className="px-4 py-3 text-green-400">₹{worker.dailyWage} / day</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">{renderWorkerSites(worker.id)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleViewWorker(worker)}
                              className="text-orange-400 transition hover:text-orange-300"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveWorker(worker)}
                              className="text-red-400 transition hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {filteredWorkers.map((worker) => (
                <article key={worker.id} className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
                  <p className="text-lg font-semibold text-white">{worker.name}</p>
                  <p className="text-sm text-gray-400">{worker.phone}</p>
                  <p className="mt-2 text-green-400">₹{worker.dailyWage} / day</p>
                  <div className="mt-3 flex flex-wrap gap-2">{renderWorkerSites(worker.id)}</div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <button
                      type="button"
                      onClick={() => handleViewWorker(worker)}
                      className="text-orange-400 transition hover:text-orange-300"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorker(worker)}
                      className="text-red-400 transition hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add Worker">
        <form onSubmit={handleAddWorker} className="space-y-4">
          <div>
            <label htmlFor="worker-name" className="mb-1 block text-sm text-gray-300">
              Full Name
            </label>
            <input
              id="worker-name"
              type="text"
              required
              value={workerForm.name}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="worker-phone" className="mb-1 block text-sm text-gray-300">
              Phone Number
            </label>
            <input
              id="worker-phone"
              type="text"
              required
              value={workerForm.phone}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="worker-wage" className="mb-1 block text-sm text-gray-300">
              Daily Wage in ₹
            </label>
            <input
              id="worker-wage"
              type="number"
              min="1"
              required
              value={workerForm.dailyWage}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, dailyWage: event.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Assign to Sites</label>
            <select
              multiple
              value={workerForm.siteIds}
              onChange={(event) => {
                const selectedValues = Array.from(event.target.selectedOptions).map((option) => option.value)
                setWorkerForm((prev) => ({ ...prev, siteIds: selectedValues }))
              }}
              className="h-32 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              {sites.length === 0 ? (
                <option disabled value="">
                  Create a site first to assign workers.
                </option>
              ) : (
                sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl (Windows) to select multiple sites.</p>
          </div>

          <div>
            <label htmlFor="worker-qr" className="mb-1 block text-sm text-gray-300">
              UPI QR Code Image
            </label>
            <input
              id="worker-qr"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setWorkerForm((prev) => ({ ...prev, qrFile: event.target.files?.[0] || null }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300"
            />
          </div>

          <div>
            <label htmlFor="worker-password" className="mb-1 block text-sm text-gray-300">
              Password
            </label>
            <input
              id="worker-password"
              type="password"
              required
              minLength={6}
              value={workerForm.password}
              onChange={(event) => setWorkerForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="worker-confirm-password" className="mb-1 block text-sm text-gray-300">
              Confirm Password
            </label>
            <input
              id="worker-confirm-password"
              type="password"
              required
              value={workerForm.confirmPassword}
              onChange={(event) =>
                setWorkerForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeAddModal}
              className="rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Adding...' : 'Add Worker'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedWorker)}
        onClose={() => setSelectedWorker(null)}
        title={selectedWorker ? selectedWorker.name : 'Worker Details'}
      >
        {selectedWorker ? (
          <div className="space-y-3 text-sm">
            <p className="text-gray-300">
              <span className="text-gray-400">Phone:</span> {selectedWorker.phone}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Daily Wage:</span> ₹{selectedWorker.dailyWage}
            </p>
            <div>
              <p className="mb-2 text-gray-400">Assigned Sites:</p>
              <div className="flex flex-wrap gap-2">{renderWorkerSites(selectedWorker.id)}</div>
            </div>

            {selectedWorker.upiQrUrl ? (
              <img
                src={selectedWorker.upiQrUrl}
                alt="Worker UPI QR"
                className="mx-auto mt-2 max-h-56 rounded-lg border border-gray-700"
              />
            ) : (
              <p className="text-gray-500">No UPI QR image uploaded.</p>
            )}

            {workerMetaLoading ? (
              <p className="text-gray-400">Loading financial details...</p>
            ) : (
              <>
                <p className="text-gray-300">
                  <span className="text-gray-400">Total Attendance:</span> {workerMeta.totalAttendance}
                </p>
                <p className="font-semibold text-orange-400">Pending Wages: ₹{workerMeta.pendingAmount}</p>
              </>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </DashboardLayout>
  )
}

export default WorkersPage
