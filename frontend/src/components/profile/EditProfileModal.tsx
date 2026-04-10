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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-dark-900 rounded-[32px] shadow-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-dark-800 sticky top-0 bg-white dark:bg-dark-900 z-10">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-dark-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Cover Photo */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">
              Cover Infrastructure
            </label>
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden group">
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
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">
              Identity Visual
            </label>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-3xl overflow-hidden group border-2 border-slate-100 dark:border-dark-800">
                {formData.profilePictureUrl ? (
                  <img
                    src={formData.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 dark:bg-dark-800 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-2xl font-black">
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
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">
              Public Identity
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-400"
              placeholder="Your display name"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">
              Ideological Biography
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder-slate-400"
              placeholder="Tell us about yourself..."
            />
            <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {formData.bio.length} / 500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-dark-700 transition-all font-black uppercase tracking-widest text-xs"
              disabled={isLoading || uploadingProfile || uploadingCover}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:translate-y-[-2px] transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || uploadingProfile || uploadingCover}
            >
              {isLoading ? 'Saving...' : uploadingProfile || uploadingCover ? 'Uploading...' : 'Confirm Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
