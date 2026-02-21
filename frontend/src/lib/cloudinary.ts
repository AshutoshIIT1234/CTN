import api from './api'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type UploadType = 'profile-photo' | 'cover-photo' | 'post-media' | 'resource' | 'image' | 'video'

/**
 * Upload a file to Cloudinary via the backend API
 */
export async function uploadToCloudinary(
  file: File,
  type: UploadType = 'image',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          })
        }
      },
    })

    return response.data.url
  } catch (error: any) {
    console.error('Upload failed:', error)
    throw new Error(error.response?.data?.message || 'Failed to upload file')
  }
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  type: UploadType = 'post-media',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> {
  const uploadPromises = files.map((file, index) =>
    uploadToCloudinary(file, type, (progress) => {
      onProgress?.(index, progress)
    })
  )

  return Promise.all(uploadPromises)
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, type: 'image' | 'video' | 'document'): { valid: boolean; error?: string } {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const videoTypes = ['video/mp4', 'video/quicktime']
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]

  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 50 * 1024 * 1024, // 50MB
  }

  // Check file type
  let validTypes: string[] = []
  if (type === 'image') validTypes = imageTypes
  else if (type === 'video') validTypes = videoTypes
  else if (type === 'document') validTypes = [...imageTypes, ...documentTypes]

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${validTypes.join(', ')}`,
    }
  }

  // Check file size
  if (file.size > maxSizes[type]) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${maxSizes[type] / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Get optimized Cloudinary URL with transformations
 */
export function getOptimizedImageUrl(url: string, options?: {
  width?: number
  height?: number
  quality?: 'auto' | number
  format?: 'auto' | 'jpg' | 'png' | 'webp'
}): string {
  if (!url.includes('cloudinary.com')) return url

  const { width, height, quality = 'auto', format = 'auto' } = options || {}
  
  let transformations: string[] = []
  
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)
  
  if (transformations.length === 0) return url
  
  const transformString = transformations.join(',')
  return url.replace('/upload/', `/upload/${transformString}/`)
}
