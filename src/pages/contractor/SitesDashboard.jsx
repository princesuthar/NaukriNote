import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Modal from '../../components/common/Modal'
import Toast from '../../components/common/Toast'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import { addSite, getPendingRequests, getSitesByContractor, getWorkersBySite, getWorkersByContractor } from '../../services/firestoreService'

// Fix leaflet default marker icon broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const initialFormState = { name: '', location: '', description: '', status: 'Active' }

// Inner component: listens for map clicks and updates pin position
function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
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

  // Geofence state
  const [pickedLocation, setPickedLocation] = useState(null) // { lat, lng }
  const [radius, setRadius] = useState(100) // metres

  const loadData = async () => {
    if (!contractorUser?.uid) return
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
          } catch {
            return { ...site, workerCount: 0 }
          }
        })
      )
      setSites(sitesWithCounts)
      setWorkersCount(workersList.length)
      setPendingRequestsCount(pendingRequestsList.length)
    } catch {
      showToast('Could not load dashboard data', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [contractorUser?.uid])

  const totalSites = sites.length
  const activeSites = useMemo(() => sites.filter((s) => String(s.status || '').toLowerCase() === 'active').length, [sites])

  const openAddModal = () => {
    setSubmitError('')
    setFormData(initialFormState)
    setPickedLocation(null)
    setRadius(100)
    setIsModalOpen(true)
  }

  const handleAddSite = async (event) => {
    event.preventDefault()
    if (!contractorUser?.uid) return
    if (!pickedLocation) { setSubmitError('Please pick the site location on the map'); return }
    setSubmitError('')
    setSubmitLoading(true)
    try {
      await addSite(contractorUser.uid, {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        status: formData.status,
        geofence: {
          lat: pickedLocation.lat,
          lng: pickedLocation.lng,
          radius: Number(radius),
        },
      })
      setIsModalOpen(false)
      setFormData(initialFormState)
      setPickedLocation(null)
      showToast('Site added successfully', 'success')
      await loadData()
    } catch (error) {
      setSubmitError(error?.message || 'Failed to add site')
    } finally {
      setSubmitLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Sites', value: totalSites, icon: '🏗️', valueClass: 'text-white' },
    { label: 'Active Sites', value: activeSites, icon: '🟢', valueClass: 'text-emerald-400' },
    { label: 'Total Workers', value: workersCount, icon: '👷', valueClass: 'text-white' },
    { label: 'Pending Requests', value: pendingRequestsCount, icon: '✅', valueClass: 'text-amber-400' },
  ]

  return (
    <DashboardLayout title="My Sites">
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.label} className="glass-card group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-start justify-between">
                <div><p className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</p><p className="mt-2 text-sm text-gray-400">{card.label}</p></div>
                <span className="text-lg" aria-hidden="true">{card.icon}</span>
              </div>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-white">Your Sites</h3>
            <button type="button" onClick={openAddModal} className="btn-primary px-4 py-2 text-sm">Add Site</button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className="glass-card flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
              <span className="text-3xl">🏗️</span>
              <h4 className="mt-5 text-xl font-semibold text-white">No sites yet</h4>
              <p className="mt-2 text-gray-400">Add your first construction site to get started</p>
              <button type="button" onClick={openAddModal} className="btn-primary mt-6 px-4 py-2 text-sm">Add Site</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sites.map((site) => {
                const isActive = String(site.status || '').toLowerCase() === 'active'
                return (
                  <article key={site.id} className="glass-card group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-lg font-bold text-white">{site.name}</h4>
                      <span className={isActive ? 'badge-success' : 'badge-neutral'}>{isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="mt-3 text-sm text-gray-400">📍 {site.location}</p>
                    {site.geofence && (
                      <p className="mt-1 text-xs text-gray-500">🔵 Geofence: {site.geofence.radius}m radius</p>
                    )}
                    <p className="mt-2 min-h-[40px] text-sm text-gray-500">{(site.description || 'No description added yet.').slice(0, 110)}</p>
                    <div className="my-4 border-t border-white/5" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">👷 {site.workerCount || 0} Workers</p>
                      <button type="button" onClick={() => navigate(`/workers?site=${site.id}`)} className="text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300">Manage →</button>
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
            <label htmlFor="site-name" className="mb-2 block text-sm text-gray-300">Site Name</label>
            <input id="site-name" type="text" required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label htmlFor="site-location" className="mb-2 block text-sm text-gray-300">Location (address label)</label>
            <input id="site-location" type="text" required value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-300">📍 Pick Site Location on Map <span className="text-red-400">*</span></label>
            <p className="mb-2 text-xs text-gray-500">Click anywhere on the map to drop a pin</p>
            {/* Map container needs an explicit height */}
            <div style={{ height: '260px', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer
                center={[20.5937, 78.9629]} // India centre
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <LocationPicker onSelect={setPickedLocation} />
                {pickedLocation && (
                  <>
                    <Marker position={[pickedLocation.lat, pickedLocation.lng]} />
                    <Circle
                      center={[pickedLocation.lat, pickedLocation.lng]}
                      radius={radius}
                      pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.15 }}
                    />
                  </>
                )}
              </MapContainer>
            </div>
            {pickedLocation && (
              <p className="mt-1 text-xs text-emerald-400">
                ✓ Location selected: {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="site-radius" className="mb-2 block text-sm text-gray-300">
              Geofence Radius: <span className="text-brand-400 font-semibold">{radius} metres</span>
            </label>
            <input
              id="site-radius"
              type="range"
              min="50"
              max="1000"
              step="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>50m</span><span>1000m</span>
            </div>
          </div>
          <div>
            <label htmlFor="site-description" className="mb-2 block text-sm text-gray-300">Description</label>
            <textarea id="site-description" rows="3" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="input-field resize-none" />
          </div>
          <div>
            <label htmlFor="site-status" className="mb-2 block text-sm text-gray-300">Status</label>
            <select id="site-status" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="select-field">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          {submitError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{submitError}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={submitLoading} className="btn-primary px-4 py-2 text-sm">{submitLoading ? 'Adding...' : 'Add Site'}</button>
          </div>
        </form>
      </Modal>

      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </DashboardLayout>
  )
}

export default SitesDashboard