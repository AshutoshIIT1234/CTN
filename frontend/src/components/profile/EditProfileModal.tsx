'use client'

import { useState, useRef } from 'react'
import { X, Camera, Upload } from 'lucide-react'
import { uploadToCloudinary, validateFile } from '@/lib/cloudinary'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: {
    displayName: string
    bio: string
    profilePictureUrl?: string
    coverPhotoUrl?: string
  }
  onSave: (data: { 
    displayName: string
    bio: string
    profilePictureUrl?: string
    coverPhotoUrl?: string
  }) => Promise<void>
}

export function EditProfileModal({ isOpen, onClose, initialData, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploadingProfile(true)
    setError(null)
    try {
      const url = await uploadToCloudinary(file, 'profile-photo')
      setFormData({ ...formData, profilePictureUrl: url })
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile photo')
    } finally {
      setUploadingProfile(false)
    }
  }

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setUploadingCover(true)
    setError(null)
    try {
      const url = await uploadToCloudinary(file, 'cover-photo')
      setFormData({ ...formData, coverPhotoUrl: url })
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover photo')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Cover Photo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Photo
            </label>
            <div className="relative h-32 bg-gradient-to-r from-royal-400 to-primary-400 rounded-xl overflow-hidden group">
              {formData.coverPhotoUrl && (
                <img
                  src={formData.coverPhotoUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadingCover ? (
                  <Upload className="w-8 h-8 text-white animate-pulse" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden group">
                {formData.profilePictureUrl ? (
                  <img
                    src={formData.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {formData.displayName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  disabled={uploadingProfile}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {uploadingProfile ? (
                    <Upload className="w-6 h-6 text-white animate-pulse" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Click to upload</p>
                <p className="text-xs text-gray-500">JPG, PNG or GIF (max 10MB)</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all"
              placeholder="Your display name"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="mt-2 text-xs text-gray-500">
              {formData.bio.length} / 500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              disabled={isLoading || uploadingProfile || uploadingCover}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-royal-600 to-primary-600 text-white rounded-xl hover:from-royal-700 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || uploadingProfile || uploadingCover}
            >
              {isLoading ? 'Saving...' : uploadingProfile || uploadingCover ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
