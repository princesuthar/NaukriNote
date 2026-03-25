// This service handles UPI QR image uploads to Cloudinary.

// Replace YOUR_CLOUD_NAME and upload preset with your Cloudinary values.
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload'
const UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET'

// Uploads a QR image to Cloudinary and returns the hosted secure URL.
export async function uploadQRImage(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary')
    }

    const result = await response.json()

    if (!result.secure_url) {
      throw new Error('Cloudinary response did not include secure_url')
    }

    return result.secure_url
  } catch (error) {
    console.error('Error uploading QR image:', error)
    throw error
  }
}

export { CLOUDINARY_URL, UPLOAD_PRESET }
