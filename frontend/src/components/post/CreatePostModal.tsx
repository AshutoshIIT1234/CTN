'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Smile, MapPin, Upload, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [panelType, setPanelType] = useState<'NATIONAL' | 'COLLEGE'>('NATIONAL')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user can post to college panel
  const canPostToCollege = user && (
    user.role === 'COLLEGE_USER' || 
    user.role === 'MODERATOR' || 
    user.role === 'ADMIN'
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 5 images total
    if (images.length + files.length > 5) {
      alert('You can upload a maximum of 5 images per post')
      return
    }

    setUploadingImage(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB.`)
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file.`)
        }

        // For now, convert to base64 data URL
        // In production, you'd upload to a cloud storage service
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedUrls])
    } catch (error: any) {
      alert(error.message || 'Failed to upload images')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Please enter some content for your post')
      return
    }

    // Check if user can post to selected panel
    if (panelType === 'COLLEGE' && !canPostToCollege) {
      alert('You need to be a college user to post to the college panel')
      return
    }

    setLoading(true)
    try {
      await api.post('/posts', {
        title: title.trim() || undefined,
        content: content.trim(),
        panelType,
        imageUrls: images.length > 0 ? images : undefined
      })
      
      // Reset form
      setTitle('')
      setContent('')
      setImages([])
      setPanelType('NATIONAL')
      
      // Notify parent
      onPostCreated?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to create post:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create post. Please try again.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Panel Type Selector */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPanelType('NATIONAL')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    panelType === 'NATIONAL'
                      ? 'bg-royal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌍 National Portal
                </button>
                <button
                  onClick={() => setPanelType('COLLEGE')}
                  disabled={!canPostToCollege}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    panelType === 'COLLEGE'
                      ? 'bg-royal-600 text-white'
                      : canPostToCollege
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  🏛️ College Portal
                  {!canPostToCollege && ' 🔒'}
                </button>
              </div>

              {/* Info Message */}
              {panelType === 'COLLEGE' && canPostToCollege && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  📢 This post will be visible only to members of your college
                </div>
              )}

              {panelType === 'NATIONAL' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  🌐 This post will be visible to everyone on the national portal
                </div>
              )}

              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-4 py-2 mb-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500"
                maxLength={200}
              />

              {/* Content Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500 resize-none"
                rows={6}
                maxLength={5000}
              />

              {/* Character Count */}
              <div className="text-right text-xs text-gray-500 mt-1">
                {content.length}/5000
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || images.length >= 5}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={images.length >= 5 ? 'Maximum 5 images' : 'Add images'}
                >
                  {uploadingImage ? (
                    <Upload className="w-5 h-5 text-gray-600 animate-pulse" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <span className="text-xs text-gray-500">
                  {images.length}/5 images
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading || uploadingImage}
                className="px-6 py-2 bg-royal-600 text-white text-sm font-semibold rounded-lg hover:bg-royal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
