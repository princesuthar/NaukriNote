# NaukriNote — Technology Stack & Frameworks

## 1. Frontend Frameworks & Libraries

| Technology | Version | Purpose | Usage % |
|-----------|---------|---------|---------|
| **React** | 18.3.1 | UI component library | 100% of UI |
| **React DOM** | 18.3.1 | DOM rendering for React | 100% of rendering |
| **React Router DOM** | 7.13.1 | Client-side routing & navigation | 100% of navigation |
| **Vite** | 8.0.1 | Build tool & dev server | 100% of build pipeline |
| **TailwindCSS** | 3.4.19 | Utility-first CSS framework | 100% of styling |
| **Leaflet** | 1.9.4 | Mapping library for geofencing | 10% (SitesDashboard) |
| **React Leaflet** | 4.2.1 | React wrapper for Leaflet | 10% (SitesDashboard) |

### React Hooks Used
| Hook | Usage |
|------|-------|
| `useState` | State management in all components |
| `useEffect` | Side effects, data fetching, subscriptions |
| `useMemo` | Performance optimization (filtered lists, computed values) |
| `useContext` | Auth state access via `AuthContext` |
| `useId` | Unique SVG gradient IDs in Logo component |
| `useSearchParams` | URL query parameter access in WorkersPage |
| `useNavigate` | Programmatic navigation |
| `useLocation` | Active route detection in navbar |
| `useMapEvents` | Leaflet map interaction (LocationPicker in SitesDashboard) |

---

## 2. Backend & Cloud Services

| Service | Purpose | Tier |
|---------|---------|------|
| **Firebase Authentication** | User registration, login, password reset | Free (Spark) |
| **Firebase Cloud Firestore** | NoSQL document database | Free (Spark) |
| **Cloudinary** | UPI QR code image hosting | Free tier |

### Firebase Auth Configuration
- **Contractor auth**: Email + Password authentication
- **Worker auth**: Phone-to-email conversion (`91{phone}@worksite.com`) + Password
- **Secondary Firebase App**: Used for creating worker accounts without logging out the contractor

### Cloudinary Configuration
- **Cloud Name**: `dcvilamrq`
- **Upload Preset**: `NokriNote_qr` (unsigned)
- **API Endpoint**: `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
- **Format**: Accepts `image/*`, returns `secure_url`

### Geofencing Configuration

#### Leaflet & React Leaflet
- **Map Library**: Leaflet (free, open-source)
- **React Integration**: react-leaflet for component-based map management
- **Tile Provider**: OpenStreetMap (default)
- **Fixed Marker Icons**: Custom icon URLs configured to work with Vite bundler

#### Geolocation API
- **Source**: W3C Geolocation API (browser native)
- **Usage**: Retrieves worker's GPS coordinates
- **Options**: High accuracy, 10-second timeout
- **Fallback**: Graceful degradation if location unavailable

#### Nominatim Geocoding
- **Service**: OpenStreetMap Nominatim (free reverse geocoding)
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Rate Limit**: Reasonable use (1 request/second recommended)
- **Parameters**: Query string + format JSON + countrycodes=in (India filter)
- **Response**: Lat/lng coordinates for location search results

---

## 3. Build & Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Vite** | 8.0.1 | Lightning-fast HMR dev server, optimized production builds |
| **PostCSS** | 8.5.8 | CSS processing pipeline (used by Tailwind) |
| **Autoprefixer** | 10.4.27 | Automatic CSS vendor prefixes |
| **ESLint** | 9.39.4 | JavaScript linting and code quality |
| **eslint-plugin-react-hooks** | 7.0.1 | React Hooks rules enforcement |
| **eslint-plugin-react-refresh** | 0.5.2 | Fast Refresh compatibility |
| **@vitejs/plugin-react** | 6.0.1 | React JSX transform for Vite |

---

## 4. Design System

### 4.1 Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)
- **Rendering**: `-webkit-font-smoothing: antialiased`

### 4.2 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-500` | `#f97316` | Primary orange |
| `brand-400` | `#fb923c` | Light orange |
| `brand-600` | `#ea580c` | Dark orange |
| `amber-500` | `#f59e0b` | Gradient endpoint |
| `surface-400` | `#0f172a` | Page background |
| `surface-500` | `#0d1321` | Darker sections |
| `emerald-400` | `#34d399` | Success states |
| `red-400` | `#f87171` | Error states |
| `gray-400` | `#9ca3af` | Secondary text |
| `gray-500` | `#6b7280` | Muted text |

### 4.3 Glassmorphism Tiers

| Class | Blur | Saturate | Use Case |
|-------|------|----------|----------|
| `glass-card` | `blur(20px)` | `saturate(180%)` | Cards, containers |
| `glass-light` | `blur(16px)` | `saturate(150%)` | Subtle backgrounds |
| `glass-heavy` | `blur(32px)` | `saturate(200%)` | Navbar, sidebar, header |

### 4.4 Animations

| Name | Duration | Effect |
|------|----------|--------|
| `fade-in` | 0.6s | Fade from invisible to visible |
| `slide-up` | 0.6s | Slide upward with fade |
| `slide-down` | 0.3s | Slide downward with fade |
| `scale-in` | 0.3s | Scale from 95% to 100% |
| `shimmer` | 2s | Loading shimmer (infinite) |
| `float` | 6s | Floating up/down (background orbs) |
| `glow-pulse` | 3s | Pulsing glow opacity |

---

## 5. Package Dependencies Summary

### Production Dependencies (6)
```
react           ^18.3.1     Core UI library
react-dom       ^18.3.1     React DOM renderer
react-router-dom ^7.13.1    Client-side routing
firebase        ^12.11.0    Auth + Firestore
axios           ^1.13.6     HTTP client (available but mainly fetch is used)
cloudinary      ^2.9.0      Image CDN SDK
```

### Dev Dependencies (8)
```
vite                  ^8.0.1      Build tool
@vitejs/plugin-react  ^6.0.1      React plugin for Vite
tailwindcss           ^3.4.19     CSS framework
postcss               ^8.5.8      CSS processor
autoprefixer          ^10.4.27    Vendor prefixes
eslint                ^9.39.4     Linter
eslint-plugin-react-hooks   ^7.0.1
eslint-plugin-react-refresh ^0.5.2
```

---

## 6. Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support (with -webkit- prefixes) |
| Edge 90+ | ✅ Full support |
| Mobile Chrome | ✅ Full support |
| Mobile Safari | ✅ Full support |

> **Note**: `backdrop-filter` requires `-webkit-` prefix for Safari/iOS, which is included in all glass classes.
