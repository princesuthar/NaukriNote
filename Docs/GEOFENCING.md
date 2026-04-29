# NaukriNote — Geofencing System

## 1. Overview

NaukriNote implements **GPS-based geofencing** to enforce location verification for worker attendance requests. Workers can only submit attendance requests when physically present within the site's geofence boundary, preventing fraudulent attendance claims from home or other locations.

### 1.1 What is Geofencing?

Geofencing creates a virtual boundary around a physical location using GPS coordinates (latitude, longitude) and a radius in metres. When a user attempts to request attendance:

1. The system retrieves the user's current GPS location
2. Calculates distance to the site center using the Haversine formula
3. Compares distance against the geofence radius
4. **Allows** attendance request if within radius, **Blocks** if outside

### 1.2 Key Use Cases in NaukriNote

| Use Case | Benefit | Implementation |
|----------|---------|-----------------|
| **Prevent Remote Attendance** | Workers can't claim attendance from home | GPS validation before request |
| **Multi-Site Verification** | Workers can't mix up sites | Site-specific geofence on request |
| **Audit Trail** | Proof of physical presence | Optional server-side verification |
| **Dispute Resolution** | Settle attendance disputes with location data | Historical GPS data logging |

---

## 2. Architecture

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────┐
│                     Worker Device                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         WorkerHomePage Component                  │   │
│  │                                                   │   │
│  │  • Shows assigned sites (dropdown selector)      │   │
│  │  • Displays current earnings & attendance        │   │
│  │  • "Request Attendance" button                   │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼─────────────────────────────────┐   │
│  │    handleRequest() Function                      │   │
│  │                                                   │   │
│  │  1. Validate site selection                     │   │
│  │  2. Check if site.geofence exists              │   │
│  │  3. Request browser GPS permission             │   │
│  │  4. Get worker coordinates                      │   │
│  │  5. Calculate distance (Haversine)             │   │
│  │  6. Compare vs geofence radius                 │   │
│  └────────────────┬─────────────────────────────────┘   │
│                   │                                      │
│                   ├─────── (within radius)             │
│                   │           │                        │
│                   │           └──► Allow request       │
│                   │                │                   │
│                   └────── (outside radius)             │
│                            │                           │
│                            └──► Show error             │
│                                 "You are XXm away"     │
└─────────────────────────────────────────────────────────┘
        │
        │ createAttendanceRequest()
        ▼
┌─────────────────────────────────────────────────────────┐
│              Cloud Firestore (Backend)                   │
│                                                          │
│  ┌──────────┐         ┌──────────────────────────────┐ │
│  │ sites    │         │ attendance_requests          │ │
│  │          │         │                              │ │
│  │ geofence:│────────►│ {                            │ │
│  │ {        │         │   workerId,                  │ │
│  │  lat,    │         │   siteId,                    │ │
│  │  lng,    │         │   contractorId,              │ │
│  │  radius  │         │   date,                      │ │
│  │ }        │         │   status: "pending"          │ │
│  └──────────┘         │ }                            │ │
│                       └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
Contractor Dashboard (SitesDashboard.jsx)
    │
    ├─► Create Site with Map Picker
    │   ├─ Click on map → LocationPicker captures coordinates
    │   ├─ Set radius (default 100m, can customize)
    │   └─ addSite({...siteData, geofence: {lat, lng, radius}})
    │       │
    │       └─► Firestore stores geofence
    │
    └─► Site Updated with Geofence
            │
            ├─► Contractor creates assignments (assignWorkerToSite)
            │
            └─► Workers can now request attendance
                    │
                    ├─► WorkerHomePage loads sites (getSitesByWorker)
                    │   Each site now includes geofence data
                    │
                    └─► When requesting attendance:
                        1. Get worker GPS (Geolocation API)
                        2. Calculate distance to site center
                        3. If distance ≤ radius → Allow
                        4. Else → Show error with distance
```

---

## 3. Technical Implementation

### 3.1 Contractor: Setting Geofence (SitesDashboard.jsx)

#### Map Component Setup

```jsx
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

<MapContainer center={[20.5937, 78.9629]} zoom={5}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  
  {pickedLocation && (
    <>
      <Marker position={[pickedLocation.lat, pickedLocation.lng]} />
      <Circle 
        center={[pickedLocation.lat, pickedLocation.lng]} 
        radius={Number(radius)} 
        pathOptions={{ color: 'orange', weight: 2 }}
      />
    </>
  )}
  
  <LocationPicker onSelect={setPickedLocation} />
</MapContainer>
```

#### Add Site with Geofence

```jsx
const handleAddSite = async (event) => {
  event.preventDefault()
  
  // Validate location was picked
  if (!pickedLocation) {
    setSubmitError('Please pick the site location on the map')
    return
  }
  
  // Submit site with geofence data
  await addSite(contractorUser.uid, {
    name: formData.name,
    location: formData.location,
    description: formData.description,
    status: formData.status,
    geofence: {
      lat: pickedLocation.lat,
      lng: pickedLocation.lng,
      radius: Number(radius), // in metres
    },
  })
}
```

#### Location Search (Nominatim API)

```jsx
const handleLocationSearch = async () => {
  if (!searchQuery.trim()) return
  
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(searchQuery)}&` +
    `format=json&limit=5&countrycodes=in`
  )
  
  const data = await response.json()
  setSearchResults(data)
  
  // User clicks result → center map on coordinates
  if (data[0]) {
    setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)])
    setPickedLocation({ 
      lat: parseFloat(data[0].lat), 
      lng: parseFloat(data[0].lon) 
    })
  }
}
```

### 3.2 Worker: Requesting Attendance with Geofence Check (WorkerHomePage.jsx)

#### Haversine Distance Calculation

```javascript
/**
 * Calculate great-circle distance between two GPS points using Haversine formula
 * @param {number} lat1 - Worker latitude
 * @param {number} lng1 - Worker longitude
 * @param {number} lat2 - Site latitude
 * @param {number} lng2 - Site longitude
 * @returns {number} Distance in metres
 */
function getDistanceMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Earth radius in metres
  
  const toRad = (deg) => (deg * Math.PI) / 180
  
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

#### Attendance Request Handler

```javascript
const handleRequest = async () => {
  if (!selectedSiteId) {
    setError('Select a site')
    return
  }

  setRequesting(true)
  setError('')

  try {
    // Get selected site (includes geofence data)
    const selectedSite = assignedSites.find((s) => s.id === selectedSiteId)

    // STEP 1: Check if geofence is configured
    if (selectedSite?.geofence) {
      const { lat: siteLat, lng: siteLng, radius: siteRadius } = selectedSite.geofence

      // STEP 2: Get worker's current GPS location
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('GPS not supported on this device'))
          return
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
        })
      })

      // STEP 3: Extract coordinates
      const workerLat = position.coords.latitude
      const workerLng = position.coords.longitude

      // STEP 4: Calculate distance
      const distance = getDistanceMetres(workerLat, workerLng, siteLat, siteLng)

      // STEP 5: Compare with geofence radius
      if (distance > siteRadius) {
        const distanceAway = Math.round(distance)
        setError(
          `You are ${distanceAway}m away from the site. ` +
          `You must be within ${siteRadius}m to request attendance.`
        )
        setRequesting(false)
        return
      }
      
      // Within geofence → proceed to attendance request
    }

    // STEP 6: Submit attendance request
    await createAttendanceRequest({
      workerId: workerProfile.id,
      siteId: selectedSiteId,
      contractorId: workerProfile.contractorId,
      date: today(),
      requestedAt: new Date().toISOString(),
    })

    setRequestSent(true)
    setTodayRequested(true)
    setTimeout(() => setRequestSent(false), 3000)

  } catch (err) {
    // Handle specific geolocation errors
    if (err.code === 1) {
      setError('Location permission denied. Please allow location access.')
    } else if (err.code === 3) {
      setError('Could not get your location. Please try again.')
    } else {
      setError(err.message || 'Failed to request attendance.')
    }
  } finally {
    setRequesting(false)
  }
}
```

---

## 4. Geofence Configuration

### 4.1 Recommended Radius Values

| Radius | Use Case | Recommendation |
|--------|----------|-----------------|
| **50m** | Very small plots (< 0.5 hectare) | Strict enforcement, minimal GPS drift tolerance |
| **100m** | Standard construction sites (2-3 hectares) | **RECOMMENDED** — balances enforcement & practical GPS limitations |
| **200m** | Large construction sites (5+ hectares) | Relaxed enforcement, handles GPS uncertainties |
| **500m+** | Very large or distributed sites | Minimal enforcement, should combine with server-side verification |

### 4.2 GPS Accuracy Considerations

```
Typical GPS Accuracy by Device Type:

┌─────────────────────┬──────────────┬─────────────────────┐
│ Device Type         │ Accuracy     │ Conditions          │
├─────────────────────┼──────────────┼─────────────────────┤
│ Smartphone (Android)│ ±5-10m       │ Clear sky, modern   │
│ Smartphone (iOS)    │ ±3-7m        │ Clear sky, modern   │
│ GPS with A-GPS      │ ±1-2m        │ Clear sky, enabled  │
│ Urban canyon        │ ±15-30m      │ Tall buildings      │
│ Forested area       │ ±15-20m      │ Dense canopy        │
│ Indoor (assisted)   │ ±30-50m      │ WiFi/LTE only       │
└─────────────────────┴──────────────┴─────────────────────┘

RECOMMENDATION:
  Set geofence radius ≥ 100m to account for:
  - GPS drift (±5-10m)
  - Altitude variations (±5-10m)
  - Network effects (±5m)
  Total buffer: ~20-30m → 100m provides 3x safety margin
```

### 4.3 Managing Geofence Boundaries

#### Update Site Geofence

```javascript
// Contractor can update geofence location or radius
await updateSite(siteId, {
  geofence: {
    lat: newLat,
    lng: newLng,
    radius: newRadius,
  }
})
```

#### Remove/Disable Geofence

```javascript
// To allow attendance without location check:
await updateSite(siteId, {
  geofence: null  // or omit the field
})
// Now workers can request attendance from anywhere
```

---

## 5. Algorithms & Formulas

### 5.1 Haversine Formula (Great-Circle Distance)

The Haversine formula calculates the shortest distance between two points on a sphere given their longitudes and latitudes.

```
Mathematical Formula:
  a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
  c = 2 × atan2(√a, √(1−a))
  d = R × c

Where:
  R = Earth's radius (6,371,000 metres)
  lat1, lon1 = Worker's coordinates (in radians)
  lat2, lon2 = Site's coordinates (in radians)
  d = Distance between points (metres)

Accuracy: ±0.5 metres over 100m distances
Complexity: O(1) — constant time calculation
```

### 5.2 Geofence Validation Algorithm

```
ALGORITHM: validateGeofenceCompliance(workerGPS, siteGeofence)

INPUT:
  workerGPS = { latitude, longitude }
  siteGeofence = { lat, lng, radius }

OUTPUT:
  { isValid, distance, message }

STEPS:
  1. IF siteGeofence is null or undefined:
       RETURN { isValid: true, message: "No geofence" }

  2. distance = haversine(
       workerGPS.latitude, workerGPS.longitude,
       siteGeofence.lat, siteGeofence.lng
     )

  3. IF distance ≤ siteGeofence.radius:
       RETURN {
         isValid: true,
         distance: distance,
         message: "Within geofence"
       }

  4. ELSE:
       RETURN {
         isValid: false,
         distance: distance,
         message: `Outside geofence: ${distance}m away (radius: ${radius}m)`
       }

COMPLEXITY: O(1)
LATENCY: ~100-200ms (GPS acquisition ~5-10s, calculation ~1ms)
```

---

## 6. Error Handling

### 6.1 Geolocation API Errors

```javascript
// Error codes:
// code 1: PERMISSION_DENIED (user denied location access)
// code 2: POSITION_UNAVAILABLE (browser couldn't retrieve location)
// code 3: TIMEOUT (location request timed out)

navigator.geolocation.getCurrentPosition(
  (position) => { /* success */ },
  (error) => {
    switch (error.code) {
      case 1:
        console.error('User denied location permission')
        // Show: "Please enable location permission in settings"
        break
      case 2:
        console.error('Location not available')
        // Show: "Could not determine your location"
        break
      case 3:
        console.error('Location request timed out')
        // Show: "Location request took too long. Try again."
        break
    }
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0 // Don't use cached position
  }
)
```

### 6.2 User-Facing Error Messages

```
Scenario 1: Outside Geofence
  Message: "You are 450m away from the site. You must be within 100m to request attendance."
  Action: Worker must move closer to site

Scenario 2: Permission Denied
  Message: "Location permission denied. Please allow location access in settings."
  Action: User must grant browser permission to location

Scenario 3: Location Unavailable
  Message: "Could not get your location. Please try again or check GPS is enabled."
  Action: Check device GPS, move outdoors, retry

Scenario 4: No Geofence Set
  Message: "This site doesn't have location verification. You can request attendance."
  Action: Attendance allowed without geofence check
```

---

## 7. Security Considerations

### 7.1 Client-Side vs Server-Side Validation

**Current Implementation (Client-Side)**:
- ✅ Fast response (immediate feedback)
- ✅ Works offline (if geofence cached)
- ❌ Can be spoofed (worker could fake GPS location)
- ❌ No audit trail on backend

**Production Recommendation**:
```
Enhancement: Server-Side Verification

1. Client sends: { attendanceRequest, workerGPS, workerGPSAccuracy }
2. Server validates:
   - Signature of GPS data (prevent tampering)
   - Device fingerprint (prevent multi-device spoofing)
   - Geofence compliance
   - Historical patterns (unusual locations flagged)
3. Server returns: { approved, reason }

This prevents:
- GPS spoofing via fake coordinates
- Use of previously cached locations
- Requests from unauthorized devices
```

### 7.2 Privacy Considerations

```
Data Collected:
- Latitude / Longitude (precise location)
- Timestamp (when attendance requested)
- Device identifier (optional)

Privacy Risks:
⚠️  Historical location data could reveal worker patterns
⚠️  Contractor could track worker movements outside work hours
⚠️  GPS data is sensitive personal information

Mitigation:
✅ Store only aggregated geofence validation results (pass/fail)
✅ Don't log GPS coordinates, only distance vs radius
✅ Implement data retention policy (delete after 30/60 days)
✅ Require explicit worker consent for location tracking
✅ Provide data access to workers (GDPR compliance)
```

### 7.3 Permission Handling

```javascript
// HTTPS Required
if (window.location.protocol !== 'https:' && 
    window.location.hostname !== 'localhost') {
  console.warn('Geolocation API requires HTTPS')
}

// Check Permission Status
if (navigator.permissions) {
  navigator.permissions.query({ name: 'geolocation' }).then(result => {
    if (result.state === 'denied') {
      console.log('User previously denied location access')
      // Show: "Enable location in browser settings"
    }
  })
}
```

---

## 8. Best Practices

### 8.1 For Contractors (Setting Geofences)

| Practice | Why | How |
|----------|-----|-----|
| **Use accurate site center** | Geofence should represent actual work area | Stand at site center, use map picker |
| **Account for site size** | Radius should cover entire working area | Measure site dimensions, add 20% buffer |
| **Test with workers** | Verify radius works from site boundaries | Have worker test from edge of site |
| **Document boundaries** | Clear communication prevents disputes | Share map screenshot with workers |
| **Regular review** | Update as site grows or changes | Check radius seasonally |

### 8.2 For Workers (Requesting Attendance)

| Practice | Why | How |
|----------|-----|-----|
| **Check geofence before visit** | Avoid wasted trip if boundary too strict | Ask contractor about radius |
| **Keep GPS enabled** | Accurate location retrieval | Enable device GPS before shift |
| **Request indoors/outdoors appropriately** | Buildings block GPS signals | Request attendance in open area |
| **Note location issues** | Help contractor adjust radius if needed | Report if boundary seems wrong |
| **Use official hours** | Avoid after-hours geofence conflicts | Request during approved shifts |

### 8.3 Radius Adjustment Workflow

```
Scenario: Workers frequently report "outside geofence" when at site

1. INVESTIGATION:
   ✓ Check site boundaries (map visualization)
   ✓ Ask workers where they're attempting request
   ✓ Test GPS location from that point
   ✓ Verify actual distance vs reported distance

2. DECISION:
   If actual site > geofence radius:
     → Increase radius (add buffer for GPS accuracy)
   If workers requesting from outside actual site:
     → Educate workers on correct location
   If GPS accuracy poor (urban/forested):
     → Increase radius to 150-200m

3. IMPLEMENTATION:
   → Update site geofence radius
   → Notify workers of change
   → Test verification again
```

---

## 9. Testing & Validation

### 9.1 Test Cases

```javascript
// Test 1: Worker within geofence
Test: Worker at site center (0m away), radius 100m
Expected: ✅ Attendance request allowed

// Test 2: Worker at geofence boundary
Test: Worker at 100m exactly, radius 100m
Expected: ✅ Attendance request allowed

// Test 3: Worker just outside geofence
Test: Worker at 101m away, radius 100m
Expected: ❌ Attendance request blocked
         Error: "You are 101m away from the site. Must be within 100m."

// Test 4: No geofence set
Test: Site without geofence data, worker anywhere
Expected: ✅ Attendance request allowed (geofence bypass)

// Test 5: GPS permission denied
Test: User denies browser location permission
Expected: ❌ Error: "Location permission denied. Please allow access."

// Test 6: Large distance
Test: Worker 5km away from site
Expected: ❌ Attendance request blocked
         Error: "You are 5000m away..."

// Test 7: Haversine accuracy
Test: Two points exactly 100m apart (measured)
Expected: ✅ Distance calculation within ±1m
```

### 9.2 Manual Testing Checklist

```
□ Contractor can create site with map picker
□ Contractor can set custom radius (50m, 100m, 200m)
□ Contractor can search location (Nominatim API works)
□ Contractor can update geofence on existing site
□ Worker sees site with geofence in dropdown
□ Worker can request attendance from within geofence
□ Worker gets error when requesting from outside geofence
□ Distance display is accurate (±5m tolerance)
□ Error messages are clear and helpful
□ Works on mobile devices (iOS, Android)
□ Works with slow GPS acquisition (show spinner)
□ Works when geofence is null (backward compatibility)
```

---

## 10. Troubleshooting

### 10.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **"GPS not supported"** | Old browser or no device GPS | Use modern browser, enable device GPS |
| **"Location permission denied"** | User declined permission | Settings → Browser → Permissions → Location |
| **Always outside geofence** | Radius too small OR GPS inaccuracy | Increase radius by 20-50m |
| **Geofence circle not visible** | Zoom level too high | Zoom in on map in SitesDashboard |
| **Coordinates swapped** | Leaflet expects [lat, lng], Nominatim returns "lat"/"lon" | Check coordinate order in code |
| **Empty Nominatim results** | Location name not found | Use full name: "Mumbai, Maharashtra, India" |

### 10.2 GPS Accuracy Debugging

```javascript
// Enable verbose logging
const handleRequest = async () => {
  if (!selectedSiteId) return
  
  setRequesting(true)
  const selectedSite = assignedSites.find((s) => s.id === selectedSiteId)
  
  if (selectedSite?.geofence) {
    const { lat: siteLat, lng: siteLng, radius: siteRadius } = selectedSite.geofence
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })
      
      const workerLat = position.coords.latitude
      const workerLng = position.coords.longitude
      const accuracy = position.coords.accuracy // GPS accuracy radius in metres
      
      // Debug log
      console.log('Worker GPS:', { workerLat, workerLng, accuracy })
      console.log('Site:', { siteLat, siteLng, radius: siteRadius })
      
      const distance = getDistanceMetres(workerLat, workerLng, siteLat, siteLng)
      console.log('Distance:', distance, 'vs Radius:', siteRadius)
      console.log('Status:', distance <= siteRadius ? 'PASS' : 'FAIL')
      
      // ... rest of handler
    }
  }
}
```

---

## 11. Future Enhancements

### 11.1 Planned Improvements

```
Phase 2 (Server-Side Verification):
  □ Server validates geofence compliance
  □ GPS signature verification (prevent spoofing)
  □ Device fingerprinting
  □ Anomaly detection (unusual locations flagged)

Phase 3 (Advanced Geofencing):
  □ Polygon geofencing (non-circular boundaries)
  □ Multiple zones per site (different entry/exit rules)
  □ Time-based geofence rules (strict after hours)
  □ Geofence analytics (heatmaps of worker locations)

Phase 4 (Integration):
  □ Google Maps integration (premium features)
  □ Real-time location tracking (contractor dashboard)
  □ Geofence violations logging & alerts
  □ Mobile app with background location services
```

### 11.2 Performance Optimization

```javascript
// Cache geofence data locally
const [cachedGeofences, setCachedGeofences] = useState({})

// Use cached geofence if fresh (< 5 minutes)
const getSiteGeofence = async (siteId) => {
  const cached = cachedGeofences[siteId]
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data
  }
  
  // Fetch fresh data
  const site = await getSiteById(siteId)
  setCachedGeofences(prev => ({
    ...prev,
    [siteId]: { data: site.geofence, timestamp: Date.now() }
  }))
  
  return site.geofence
}
```

---

## 12. References

### 12.1 External Resources

- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula
- **W3C Geolocation API**: https://www.w3.org/TR/geolocation-API/
- **Leaflet Documentation**: https://leafletjs.com/
- **Nominatim Geocoding**: https://nominatim.org/
- **GPS Accuracy**: https://gpsworld.com/what-exactly-is-gps-accuracy/

### 12.2 Related NaukriNote Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture overview
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Firestore geofence schema
- [ALGORITHMS.md](./ALGORITHMS.md) — Haversine distance algorithm
- [API_REFERENCE.md](./API_REFERENCE.md) — Geolocation API reference
- [TECH_STACK.md](./TECH_STACK.md) — Leaflet & geofencing libraries

---

## 13. Changelog

### Version 1.0 (Current)
- ✅ Client-side geofence validation using Haversine formula
- ✅ Contractor map-based geofence setup (Leaflet + Nominatim)
- ✅ Worker GPS-based attendance verification
- ✅ Error handling for permissions, timeouts, unavailable locations
- ✅ Backward compatibility (sites without geofence allowed)

### Planned: Version 2.0
- ⏳ Server-side geofence validation
- ⏳ GPS spoofing detection
- ⏳ Geofence analytics & heatmaps
- ⏳ Polygon-based geofences
