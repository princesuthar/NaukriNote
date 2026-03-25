// Formats a JavaScript Date object into YYYY-MM-DD.
export function formatDate(date) {
  try {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    throw error
  }
}

// Returns today's date string in YYYY-MM-DD format.
export function getTodayString() {
  try {
    return formatDate(new Date())
  } catch (error) {
    console.error('Error getting today date string:', error)
    throw error
  }
}

// Converts a phone number to worker auth email format.
export function phoneToEmail(phone) {
  try {
    const sanitizedPhone = String(phone).replace(/\D/g, '')
    return `91${sanitizedPhone}@worksite.com`
  } catch (error) {
    console.error('Error converting phone to email:', error)
    throw error
  }
}

// Formats a numeric amount as INR currency like ₹1,000.
export function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))
  } catch (error) {
    console.error('Error formatting currency:', error)
    throw error
  }
}
