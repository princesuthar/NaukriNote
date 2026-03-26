# NaukriNote — Database Schema (Cloud Firestore)

## 1. Overview

NaukriNote uses **Google Cloud Firestore** — a NoSQL document database. Data is organized into **6 collections** with document-based relationships.

---

## 2. Collections

### 2.1 `contractors`

Stores contractor (manager) profile data. Document ID = Firebase Auth UID.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `uid` | string | Firebase Auth UID (same as doc ID) | `"abc123def456"` |
| `name` | string | Full name | `"Rajesh Patel"` |
| `email` | string | Login email | `"rajesh@gmail.com"` |
| `phone` | string | Contact number | `"9876543210"` |
| `companyName` | string | Business name | `"Patel Construction"` |
| `createdAt` | timestamp | Account creation time | `2025-03-15T10:30:00Z` |

**Relationships**: One contractor → Many sites, One contractor → Many workers

---

### 2.2 `sites`

Stores construction site information.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `contractorId` | string | Owner contractor UID | `"abc123def456"` |
| `name` | string | Site name | `"Sai Residency Tower"` |
| `location` | string | Physical location | `"Andheri West, Mumbai"` |
| `description` | string | Optional notes | `"20-floor residential"` |
| `status` | string | Active/Inactive | `"Active"` |
| `createdAt` | timestamp | Creation time | `2025-03-15T10:30:00Z` |

**Relationships**: One site → Many workers (via `site_workers`)

---

### 2.3 `workers`

Stores worker profile and wage information.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `contractorId` | string | Employer contractor UID | `"abc123def456"` |
| `name` | string | Full name | `"Ramesh Kumar"` |
| `phone` | string | 10-digit phone | `"7021110518"` |
| `dailyWage` | number | Wage per day (INR) | `800` |
| `upiQrUrl` | string | Cloudinary URL for UPI QR | `"https://res.cloudinary.com/..."` |
| `authUid` | string | Firebase Auth UID for worker | `"xyz789ghi012"` |
| `createdAt` | timestamp | Profile creation time | `2025-03-15T10:30:00Z` |

**Relationships**: One worker → Many sites (via `site_workers`), One worker → Many attendance records

---

### 2.4 `site_workers`

Junction table for many-to-many site-worker assignments.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `siteId` | string | Assigned site ID | `"site_abc123"` |
| `workerId` | string | Assigned worker ID | `"worker_xyz789"` |
| `contractorId` | string | Owner contractor UID | `"abc123def456"` |
| `assignedAt` | timestamp | Assignment time | `2025-03-15T10:30:00Z` |

**Purpose**: Enables workers to be assigned to multiple sites and sites to have multiple workers.

---

### 2.5 `attendance`

Stores daily attendance records per worker per site.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `contractorId` | string | Contractor UID | `"abc123def456"` |
| `workerId` | string | Worker ID | `"worker_xyz789"` |
| `siteId` | string | Site ID | `"site_abc123"` |
| `date` | string | Date (YYYY-MM-DD) | `"2025-03-27"` |
| `status` | string | present / absent | `"present"` |
| `source` | string | Manual / request | `"request"` |
| `createdAt` | timestamp | Record creation time | `2025-03-27T09:00:00Z` |

**Query Patterns**:
- By worker: `where('workerId', '==', id)`
- By site: `where('siteId', '==', id)`
- By site + date: `where('siteId', '==', id) + where('date', '==', date)`
- Present only: `where('status', '==', 'present')`

---

### 2.6 `attendance_requests`

Stores worker-initiated attendance requests with approval workflow.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `workerId` | string | Requesting worker | `"worker_xyz789"` |
| `siteId` | string | Site for attendance | `"site_abc123"` |
| `contractorId` | string | Approving contractor | `"abc123def456"` |
| `date` | string | Date (YYYY-MM-DD) | `"2025-03-27"` |
| `status` | string | pending / approved / rejected | `"pending"` |
| `requestedAt` | timestamp | Request submission time | `2025-03-27T08:00:00Z` |
| `resolvedAt` | timestamp / null | Approval/rejection time | `2025-03-27T09:00:00Z` |

**Real-time**: This collection uses `onSnapshot()` for live updates to contractor dashboard.

---

### 2.7 `payroll_payments`

Stores individual payment records.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `contractorId` | string | Paying contractor | `"abc123def456"` |
| `workerId` | string | Receiving worker | `"worker_xyz789"` |
| `amount` | number | Payment amount (INR) | `5000` |
| `note` | string | Optional note | `"Weekly payment"` |
| `paidAt` | timestamp | Payment time | `2025-03-27T18:00:00Z` |

---

## 3. Entity Relationship Diagram

```
┌──────────────┐      1:N      ┌──────────────┐
│  contractors │──────────────▶│    sites      │
│              │               │              │
│  uid (PK)    │      1:N      │  id (PK)     │
│  name        │──────┐       │  contractorId │
│  email       │      │       │  name         │
│  phone       │      │       │  location     │
│  companyName │      │       │  status       │
└──────────────┘      │       └──────┬────────┘
                      │              │
                      ▼              │
              ┌──────────────┐       │  M:N
              │   workers    │       │ (via site_workers)
              │              │◀──────┘
              │  id (PK)     │
              │  contractorId│──────▶┌──────────────┐
              │  name        │       │ site_workers  │
              │  phone       │       │               │
              │  dailyWage   │       │  siteId       │
              │  upiQrUrl    │       │  workerId     │
              │  authUid     │       │  contractorId │
              └──────┬───────┘       └───────────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
  ┌────────────┐ ┌──────────┐ ┌─────────────────┐
  │ attendance │ │ att_req  │ │payroll_payments  │
  │            │ │          │ │                  │
  │ workerId   │ │ workerId │ │  workerId        │
  │ siteId     │ │ siteId   │ │  contractorId    │
  │ date       │ │ date     │ │  amount          │
  │ status     │ │ status   │ │  paidAt          │
  └────────────┘ └──────────┘ └─────────────────┘
```

---

## 4. Data Volume Estimates

| Collection | Expected Documents (per contractor) | Growth Rate |
|------------|-------------------------------------|-------------|
| `contractors` | 1 | Static |
| `sites` | 2–10 | Low |
| `workers` | 10–100 | Medium |
| `site_workers` | 10–200 | Medium |
| `attendance` | 300–3,000/month (workers × working days) | High |
| `attendance_requests` | 100–1,000/month | Medium |
| `payroll_payments` | 40–400/month | Medium |

---

## 5. Firestore Indexes Required

Most queries use single-field indexes (auto-created). The following **composite indexes** may be needed:

| Collection | Fields | Type |
|------------|--------|------|
| `attendance` | `siteId` + `date` | Composite (ascending) |
| `attendance_requests` | `contractorId` + `status` | Composite (ascending) |
| `attendance` | `workerId` + `status` | Composite (ascending) |
