import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'

// Creates or overwrites a contractor profile using the auth UID as document ID.
export async function createContractor(uid, data) {
  try {
    await setDoc(doc(db, 'contractors', uid), {
      uid,
      ...data,
      createdAt: serverTimestamp(),
    })

    return { id: uid, uid, ...data }
  } catch (error) {
    console.error('Error creating contractor:', error)
    throw error
  }
}

// Fetches a contractor profile by auth UID.
export async function getContractor(uid) {
  try {
    const contractorRef = doc(db, 'contractors', uid)
    const snapshot = await getDoc(contractorRef)

    if (!snapshot.exists()) {
      return null
    }

    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('Error fetching contractor:', error)
    throw error
  }
}

// Adds a new site under a contractor.
export async function addSite(contractorId, siteData) {
  try {
    const siteRef = await addDoc(collection(db, 'sites'), {
      contractorId,
      ...siteData,
      createdAt: serverTimestamp(),
    })

    return { id: siteRef.id, contractorId, ...siteData }
  } catch (error) {
    console.error('Error adding site:', error)
    throw error
  }
}

// Returns all sites created by a specific contractor.
export async function getSitesByContractor(contractorId) {
  try {
    const sitesQuery = query(collection(db, 'sites'), where('contractorId', '==', contractorId))
    const snapshot = await getDocs(sitesQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching sites by contractor:', error)
    throw error
  }
}

// Updates a site document by ID.
export async function updateSite(siteId, data) {
  try {
    await updateDoc(doc(db, 'sites', siteId), data)
    return { id: siteId, ...data }
  } catch (error) {
    console.error('Error updating site:', error)
    throw error
  }
}

// Deletes a site document by ID.
export async function deleteSite(siteId) {
  try {
    await deleteDoc(doc(db, 'sites', siteId))
    return true
  } catch (error) {
    console.error('Error deleting site:', error)
    throw error
  }
}

// Adds a worker profile under a contractor.
export async function addWorker(contractorId, workerData) {
  try {
    const workerRef = await addDoc(collection(db, 'workers'), {
      contractorId,
      ...workerData,
      createdAt: serverTimestamp(),
    })

    return { id: workerRef.id, contractorId, ...workerData }
  } catch (error) {
    console.error('Error adding worker:', error)
    throw error
  }
}

// Returns all workers added by a specific contractor.
export async function getWorkersByContractor(contractorId) {
  try {
    const workersQuery = query(collection(db, 'workers'), where('contractorId', '==', contractorId))
    const snapshot = await getDocs(workersQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching workers by contractor:', error)
    throw error
  }
}

// Fetches a worker document by worker ID.
export async function getWorkerById(workerId) {
  try {
    const workerRef = doc(db, 'workers', workerId)
    const snapshot = await getDoc(workerRef)

    if (!snapshot.exists()) {
      return null
    }

    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('Error fetching worker by ID:', error)
    throw error
  }
}

// Fetches a worker document by phone number.
export async function getWorkerByPhone(phone) {
  try {
    const workersQuery = query(collection(db, 'workers'), where('phone', '==', phone))
    const snapshot = await getDocs(workersQuery)

    if (snapshot.docs.length === 0) {
      return null
    }

    // Return the first match (phone should be unique)
    const workerDoc = snapshot.docs[0]
    return { id: workerDoc.id, ...workerDoc.data() }
  } catch (error) {
    console.error('Error fetching worker by phone:', error)
    throw error
  }
}

// Updates a worker document by ID.
export async function updateWorker(workerId, data) {
  try {
    await updateDoc(doc(db, 'workers', workerId), data)
    return { id: workerId, ...data }
  } catch (error) {
    console.error('Error updating worker:', error)
    throw error
  }
}

// Deletes a worker document by ID.
export async function deleteWorker(workerId) {
  try {
    await deleteDoc(doc(db, 'workers', workerId))
    return true
  } catch (error) {
    console.error('Error deleting worker:', error)
    throw error
  }
}

// Assigns a worker to a site for a contractor.
export async function assignWorkerToSite(siteId, workerId, contractorId) {
  try {
    const assignmentRef = await addDoc(collection(db, 'site_workers'), {
      siteId,
      workerId,
      contractorId,
      assignedAt: serverTimestamp(),
    })

    return { id: assignmentRef.id, siteId, workerId, contractorId }
  } catch (error) {
    console.error('Error assigning worker to site:', error)
    throw error
  }
}

// Returns all worker assignments for a specific site.
// Fetches the full worker document details for each assignment.
export async function getWorkersBySite(siteId) {
  try {
    const q = query(
      collection(db, 'site_workers'),
      where('siteId', '==', siteId)
    )
    const snapshot = await getDocs(q)
    console.log(`Found ${snapshot.docs.length} site_workers assignments for siteId: ${siteId}`)
    
    const workerPromises = snapshot.docs.map(async (docSnap) => {
      const { workerId } = docSnap.data()
      console.log(`Fetching worker details for workerId: ${workerId}`)
      const workerDoc = await getDoc(doc(db, 'workers', workerId))
      if (workerDoc.exists()) {
        return { 
          id: workerDoc.id, 
          siteWorkerId: docSnap.id,
          ...workerDoc.data() 
        }
      }
      console.warn(`Worker document not found for workerId: ${workerId}`)
      return null
    })
    
    const workers = await Promise.all(workerPromises)
    const validWorkers = workers.filter(Boolean)
    console.log(`Successfully loaded ${validWorkers.length} workers with details`)
    return validWorkers
  } catch (error) {
    console.error('Error getting workers by site:', error)
    throw error
  }
}

// Returns all site assignments for a specific worker with full site details.
export async function getSitesByWorker(workerId) {
  try {
    const q = query(
      collection(db, 'site_workers'),
      where('workerId', '==', workerId)
    )
    const snapshot = await getDocs(q)
    
    const sitePromises = snapshot.docs.map(async (docSnap) => {
      const { siteId } = docSnap.data()
      const siteDoc = await getDoc(doc(db, 'sites', siteId))
      if (siteDoc.exists()) {
        return {
          id: siteDoc.id,
          siteWorkerId: docSnap.id,
          ...siteDoc.data()
        }
      }
      return null
    })
    
    const sites = await Promise.all(sitePromises)
    return sites.filter(Boolean)
  } catch (error) {
    console.error('Error getting sites by worker:', error)
    throw error
  }
}

// Removes a worker-site assignment by assignment document ID.
export async function removeWorkerFromSite(docId) {
  try {
    await deleteDoc(doc(db, 'site_workers', docId))
    return true
  } catch (error) {
    console.error('Error removing worker from site:', error)
    throw error
  }
}

// Records a worker attendance entry.
export async function markAttendance(data) {
  try {
    const attendanceRef = await addDoc(collection(db, 'attendance'), {
      ...data,
      createdAt: serverTimestamp(),
    })

    return { id: attendanceRef.id, ...data }
  } catch (error) {
    console.error('Error marking attendance:', error)
    throw error
  }
}

// Returns all attendance records for a worker.
export async function getAttendanceByWorker(workerId) {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('workerId', '==', workerId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting attendance:', error)
    throw error
  }
}

// Returns all attendance records for a site.
export async function getAttendanceBySite(siteId) {
  try {
    const attendanceQuery = query(collection(db, 'attendance'), where('siteId', '==', siteId))
    const snapshot = await getDocs(attendanceQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching attendance by site:', error)
    throw error
  }
}

// Returns attendance records filtered by site and date.
export async function getAttendanceByDate(siteId, date) {
  try {
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('siteId', '==', siteId),
      where('date', '==', date)
    )
    const snapshot = await getDocs(attendanceQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching attendance by date:', error)
    throw error
  }
}

// Creates a worker attendance request with pending status by default.
export async function createAttendanceRequest(data) {
  try {
    const requestRef = await addDoc(collection(db, 'attendance_requests'), {
      ...data,
      status: 'pending',
      requestedAt: data.requestedAt || serverTimestamp(),
      resolvedAt: null,
    })

    return { id: requestRef.id, ...data, status: 'pending', resolvedAt: null }
  } catch (error) {
    console.error('Error creating attendance request:', error)
    throw error
  }
}

// Returns pending attendance requests for a contractor.
export async function getPendingRequests(contractorId) {
  try {
    const requestsQuery = query(
      collection(db, 'attendance_requests'),
      where('contractorId', '==', contractorId),
      where('status', '==', 'pending')
    )
    const snapshot = await getDocs(requestsQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    throw error
  }
}

// Updates the status of an attendance request and records resolution time.
export async function updateRequestStatus(requestId, status) {
  try {
    await updateDoc(doc(db, 'attendance_requests', requestId), {
      status,
      resolvedAt: serverTimestamp(),
    })

    return { id: requestId, status }
  } catch (error) {
    console.error('Error updating attendance request status:', error)
    throw error
  }
}

// Adds a payroll payment record.
export async function addPayment(data) {
  try {
    const paymentRef = await addDoc(collection(db, 'payroll_payments'), {
      ...data,
      paidAt: data.paidAt || serverTimestamp(),
      note: data.note || '',
    })

    return { id: paymentRef.id, ...data }
  } catch (error) {
    console.error('Error adding payment:', error)
    throw error
  }
}

// Returns all payroll payments for a worker.
export async function getPaymentsByWorker(workerId) {
  try {
    const paymentsQuery = query(collection(db, 'payroll_payments'), where('workerId', '==', workerId))
    const snapshot = await getDocs(paymentsQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching payments by worker:', error)
    throw error
  }
}

// Returns all payroll payments made by a contractor.
export async function getPaymentsByContractor(contractorId) {
  try {
    const paymentsQuery = query(
      collection(db, 'payroll_payments'),
      where('contractorId', '==', contractorId)
    )
    const snapshot = await getDocs(paymentsQuery)
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch (error) {
    console.error('Error fetching payments by contractor:', error)
    throw error
  }
}

// Calculates total earned wages, paid amount, and pending amount for a worker.
export async function calculatePendingWages(workerId) {
  try {
    const [attendanceSnapshot, workerSnapshot, paymentsSnapshot] = await Promise.all([
      getDocs(
        query(
          collection(db, 'attendance'),
          where('workerId', '==', workerId),
          where('status', '==', 'present')
        )
      ),
      getDoc(doc(db, 'workers', workerId)),
      getDocs(query(collection(db, 'payroll_payments'), where('workerId', '==', workerId))),
    ])

    if (!workerSnapshot.exists()) {
      throw new Error('Worker not found')
    }

    const workerData = workerSnapshot.data()
    const dailyWage = Number(workerData.dailyWage || 0)
    const presentDays = attendanceSnapshot.docs.length
    const totalEarned = presentDays * dailyWage

    const totalPaid = paymentsSnapshot.docs.reduce((sum, paymentDoc) => {
      const payment = paymentDoc.data()
      return sum + Number(payment.amount || 0)
    }, 0)

    const pendingAmount = Math.max(totalEarned - totalPaid, 0)

    return {
      totalEarned,
      totalPaid,
      pendingAmount,
    }
  } catch (error) {
    console.error('Error calculating pending wages:', error)
    throw error
  }
}
