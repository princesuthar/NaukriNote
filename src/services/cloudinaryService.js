// This service handles UPI QR image uploads to Cloudinary.
// TODO: Move these back to .env once environment variable issue is resolved

const CLOUD_NAME = 'dcvilamrq'
const UPLOAD_PRESET = 'NokriNote_qr'
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

// Uploads a QR image to Cloudinary and returns the hosted secure URL.
export async function uploadQRImage(file) {
  if (!file) return ''
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to upload image')
  }

  const result = await response.json()
  return result.secure_url
}

export { CLOUDINARY_URL, UPLOAD_PRESET }