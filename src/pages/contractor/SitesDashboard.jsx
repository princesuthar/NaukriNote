// Contractor sites dashboard with stats, site management cards, and add-site flow.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/common/Modal'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import {
  addSite,
  getPendingRequests,
  getSitesByContractor,
  getWorkersBySite,
  getWorkersByContractor,
} from '../../services/firestoreService'

const initialFormState = {
  name: '',
  location: '',
  description: '',
  status: 'Active',
}

function SitesDashboard() {
  const { contractorUser } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const [sites, setSites] = useState([])
  const [workersCount, setWorkersCount] = useState(0)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const loadData = async () => {
    if (!contractorUser?.uid) {
      return
    }

    setIsLoading(true)
    try {
      const [sitesList, workersList, pendingRequestsList] = await Promise.all([
        getSitesByContractor(contractorUser.uid),
        getWorkersByContractor(contractorUser.uid),
        getPendingRequests(contractorUser.uid),
      ])

      const sitesWithCounts = await Promise.all(
        sitesList.map(async (site) => {
          try {
            const assignments = await getWorkersBySite(site.id)
            return { ...site, workerCount: assignments.length }
          } catch (error) {
            console.error('Failed to load worker count for site:', error)
            return { ...site, workerCount: 0 }
          }
        }),
      )

      setSites(sitesWithCounts)
      setWorkersCount(workersList.length)
      setPendingRequestsCount(pendingRequestsList.length)
    } catch (error) {
      console.error('Failed to load sites dashboard:', error)
      showToast('Could not load dashboard data', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [contractorUser?.uid])

  const totalSites = sites.length
  const activeSites = useMemo(
    () => sites.filter((site) => String(site.status || '').toLowerCase() === 'active').length,
    [sites],
  )

  const openAddModal = () => {
    setSubmitError('')
    setFormData(initialFormState)
    setIsModalOpen(true)
  }

  const handleAddSite = async (event) => {
    event.preventDefault()
    if (!contractorUser?.uid) {
      return
    }

    setSubmitError('')
    setSubmitLoading(true)

    try {
      await addSite(contractorUser.uid, {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        status: formData.status,
      })

      setIsModalOpen(false)
      setFormData(initialFormState)
      showToast('Site added successfully', 'success')
      await loadData()
    } catch (error) {
      console.error('Failed to add site:', error)
      setSubmitError(error?.message || 'Failed to add site')
    } finally {
      setSubmitLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Sites', value: totalSites, icon: '🏗️', valueClass: 'text-white' },
    { label: 'Active Sites', value: activeSites, icon: '🟢', valueClass: 'text-emerald-400' },
    { label: 'Total Workers', value: workersCount, icon: '👷', valueClass: 'text-white' },
    {
      label: 'Pending Attendance Requests',
      value: pendingRequestsCount,
      icon: '✅',
      valueClass: 'text-orange-400',
    },
  ]

  return (
    <DashboardLayout title="My Sites">
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.label} className="rounded-xl border border-gray-700 bg-gray-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
                  <p className="mt-2 text-sm text-gray-400">{card.label}</p>
                </div>
                <span className="text-xl" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-white">Your Sites</h3>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
            >
              Add Site
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`site-skeleton-${index + 1}`}
                  className="h-44 animate-pulse rounded-2xl border border-gray-700 bg-gray-800"
                />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center">
              <p className="text-5xl" aria-hidden="true">
                🏗️
              </p>
              <h4 className="mt-4 text-xl font-semibold text-white">No sites yet</h4>
              <p className="mt-2 text-gray-400">Add your first construction site to get started</p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
              >
                Add Site
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sites.map((site) => {
                const isActive = String(site.status || '').toLowerCase() === 'active'
                const trimmedDescription = site.description || 'No description added yet.'

                return (
                  <article key={site.id} className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-lg font-bold text-white">{site.name}</h4>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive ? 'bg-emerald-600/20 text-emerald-300' : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-400">📍 {site.location}</p>
                    <p className="mt-2 min-h-[40px] text-sm text-gray-500">
                      {trimmedDescription.length > 110
                        ? `${trimmedDescription.slice(0, 110)}...`
                        : trimmedDescription}
                    </p>

                    <div className="my-4 border-t border-gray-700" />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">👷 {site.workerCount || 0} Workers</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/workers?site=${site.id}`)}
                        className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
                      >
                        Manage →
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Site">
        <form onSubmit={handleAddSite} className="space-y-4">
          <div>
            <label htmlFor="site-name" className="mb-1 block text-sm text-gray-300">
              Site Name
            </label>
            <input
              id="site-name"
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="site-location" className="mb-1 block text-sm text-gray-300">
              Location
            </label>
            <input
              id="site-location"
              type="text"
              required
              value={formData.location}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  location: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="site-description" className="mb-1 block text-sm text-gray-300">
              Description
            </label>
            <textarea
              id="site-description"
              rows="3"
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="site-status" className="mb-1 block text-sm text-gray-300">
              Status
            </label>
            <select
              id="site-status"
              value={formData.status}
              onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-orange-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitLoading ? 'Adding...' : 'Add Site'}
            </button>
          </div>
        </form>
      </Modal>

      {toast.visible ? <Toast message={toast.message} type={toast.type} onClose={hideToast} /> : null}
    </DashboardLayout>
  )
}

export default SitesDashboard
