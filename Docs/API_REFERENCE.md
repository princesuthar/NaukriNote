# NaukriNote — API Reference & Services

## 1. Firebase Authentication API

Firebase Auth handles user registration, login, and session persistence.

### 1.1 Methods Used

| Method | Purpose | User Type |
|--------|---------|-----------|
| `createUserWithEmailAndPassword()` | Register new user | Contractor, Worker |
| `signInWithEmailAndPassword()` | Login existing user | Contractor, Worker |
| `signOut()` | Logout current session | Both |
| `sendPasswordResetEmail()` | Email password reset link | Contractor |
| `onAuthStateChanged()` | Real-time auth state listener | Both |

### 1.2 Worker Authentication Flow
Workers don't have email accounts. The system converts phone numbers to synthetic emails:

```
Phone: 7021110518
Email: 917021110518@worksite.com
Password: [set by contractor during worker creation]
```

**Algorithm**: `phoneToEmail(phone) → "91" + phone + "@worksite.com"`

### 1.3 Secondary Firebase App
When a contractor creates a worker account, a **secondary Firebase app instance** is used to avoid logging out the contractor:

```javascript
const appName = 'worker-auth-creation'
const app = initializeApp(firebaseConfig, appName) // separate app
const secondaryAuth = getAuth(app)
await createUserWithEmailAndPassword(secondaryAuth, workerEmail, password)
```

This ensures contractor session remains intact while creating worker auth accounts.

### 1.4 Auth Error Handling

| Firebase Error Code | User-Friendly Message |
|--------------------|-----------------------|
| `auth/email-already-in-use` | "This email is already registered. Please login instead." |
| `auth/weak-password` | "Password is too weak. Please use at least 6 characters." |
| `auth/invalid-email` | "Please enter a valid email address." |
| `auth/user-not-found` | "No account found with this email." |
| `auth/wrong-password` | "Incorrect email or password." |
| `auth/too-many-requests` | "Too many attempts. Please try again later." |

---

## 2. Cloud Firestore API

Firestore is the primary database. All data operations use the Firestore Web SDK v9 (modular).

### 2.1 Firestore Methods Used

| Method | Purpose |
|--------|---------|
| `addDoc()` | Create new document with auto-generated ID |
| `setDoc()` | Create/overwrite document with specific ID |
| `getDoc()` | Fetch single document |
| `getDocs()` | Fetch query results (multiple documents) |
| `updateDoc()` | Update specific fields |
| `deleteDoc()` | Delete document |
| `query()` | Build complex queries |
| `where()` | Add filter conditions |
| `collection()` | Reference a collection |
| `doc()` | Reference a specific document |
| `serverTimestamp()` | Server-side timestamp |
| `onSnapshot()` | Real-time listener (used for attendance requests) |

### 2.2 Service Functions (firestoreService.js)

#### Contractor Management
| Function | Description |
|----------|-------------|
| `createContractor(uid, data)` | Create contractor profile (uses auth UID as doc ID) |
| `getContractor(uid)` | Fetch contractor by auth UID |

#### Site Management
| Function | Description |
|----------|-------------|
| `addSite(contractorId, siteData)` | Add new construction site |
| `getSitesByContractor(contractorId)` | Get all sites for a contractor |
| `updateSite(siteId, data)` | Update site details |
| `deleteSite(siteId)` | Delete a site |

#### Worker Management
| Function | Description |
|----------|-------------|
| `addWorker(contractorId, workerData)` | Add worker under contractor |
| `getWorkersByContractor(contractorId)` | Get all workers for contractor |
| `getWorkerById(workerId)` | Fetch single worker |
| `getWorkerByPhone(phone)` | Find worker by phone number |
| `updateWorker(workerId, data)` | Update worker details |
| `deleteWorker(workerId)` | Delete worker profile |

#### Site-Worker Assignments
| Function | Description |
|----------|-------------|
| `assignWorkerToSite(siteId, workerId, contractorId)` | Create assignment |
| `getWorkersBySite(siteId)` | Get all workers assigned to a site |
| `getSitesByWorker(workerId)` | Get all sites a worker is assigned to |
| `removeWorkerFromSite(docId)` | Remove assignment |

#### Attendance
| Function | Description |
|----------|-------------|
| `markAttendance(data)` | Record attendance entry |
| `getAttendanceByWorker(workerId)` | Get all attendance for a worker |
| `getAttendanceBySite(siteId)` | Get all attendance for a site |
| `getAttendanceByDate(siteId, date)` | Get attendance filtered by site + date |

#### Attendance Requests
| Function | Description |
|----------|-------------|
| `createAttendanceRequest(data)` | Worker submits attendance request |
| `getPendingRequests(contractorId)` | Get all pending requests for contractor |
| `updateRequestStatus(requestId, status)` | Approve or reject request |

#### Payroll
| Function | Description |
|----------|-------------|
| `addPayment(data)` | Record a payment |
| `getPaymentsByWorker(workerId)` | Get payment history for worker |
| `getPaymentsByContractor(contractorId)` | Get all payments by contractor |
| `calculatePendingWages(workerId)` | Calculate total earned, paid, and pending |

---

## 3. Cloudinary API

Cloudinary is used for hosting worker UPI QR code images.

### 3.1 Upload Endpoint

```
POST https://api.cloudinary.com/v1_1/dcvilamrq/image/upload
```

### 3.2 Request Format

| Parameter | Value |
|-----------|-------|
| `file` | Image file (multipart/form-data) |
| `upload_preset` | `NokriNote_qr` (unsigned preset) |

### 3.3 Response

```json
{
  "secure_url": "https://res.cloudinary.com/dcvilamrq/image/upload/v.../qr_image.jpg",
  "public_id": "...",
  "format": "jpg",
  "width": 400,
  "height": 400
}
```

### 3.4 Error Handling
```json
{
  "error": {
    "message": "Upload preset not found"
  }
}
```

---

## 4. Geolocation and Mapping API

### 4.1 W3C Geolocation API
Browser-native API for acquiring worker's GPS coordinates.

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords
  },
  (error) => {
    // error.code: 1 (permission denied), 2 (position unavailable), 3 (timeout)
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
)
```

**Browser Support**: Desktop (Chrome, Firefox, Safari), Mobile (iOS Safari, Chrome, Firefox)
**Security**: Requires HTTPS and user permission

### 4.2 Nominatim OpenStreetMap Geocoding
Free reverse geocoding service for location search (contractor dashboard).

```
GET https://nominatim.openstreetmap.org/search
Parameters:
  - q: search query (e.g., "Mumbai")
  - format: "json"
  - limit: number of results (default 10)
  - countrycodes: "in" (filter to India)

Response:
[
  {
    "lat": "19.0760",
    "lon": "72.8777",
    "display_name": "Mumbai, Maharashtra, India",
    "importance": 0.85
  }
]
```

**Rate Limit**: 1 request per second (polite usage)
**Cost**: Free (no API key required)

### 4.3 Leaflet Map Rendering
Interactive map library for displaying and picking site locations.

```javascript
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'

// Usage in SitesDashboard:
<MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={selectedLocation} />
  <Circle center={selectedLocation} radius={radiusInMetres} />
  <LocationPicker onSelect={handleLocationPick} />
</MapContainer>
```

**Tile Provider**: OpenStreetMap (free)
**Features**: Pan, zoom, click-to-place markers, circles for radius visualization

### 4.4 Haversine Distance Calculation
Client-side distance calculation between worker GPS and site geofence center (WorkerHomePage).

```javascript
function getDistanceMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Earth radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
```

**Accuracy**: ±0.5m for typical use case
**Complexity**: O(1) - constant time calculation

---

## 5. Real-Time Features

### 5.1 Attendance Request Subscription
The attendance page uses Firestore `onSnapshot()` for real-time updates:

```javascript
const q = query(
  collection(db, 'attendance_requests'),
  where('contractorId', '==', contractorId),
  where('status', '==', 'pending')
)
onSnapshot(q, async (snapshot) => {
  // Updates UI in real-time when workers submit requests
})
```

**Latency**: < 1 second for real-time updates (Firebase Firestore real-time listener)

---

## 5. Utility Helper Functions

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `formatDate(date)` | `Date` object | `"2025-03-27"` | YYYY-MM-DD formatting |
| `getTodayString()` | — | `"2025-03-27"` | Today's date string |
| `phoneToEmail(phone)` | `"7021110518"` | `"917021110518@worksite.com"` | Phone-to-auth-email |
| `formatCurrency(amount)` | `15000` | `"₹15,000"` | INR currency formatting |
