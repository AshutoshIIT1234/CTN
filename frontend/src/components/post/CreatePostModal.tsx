'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Smile, MapPin, Upload, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { uploadMultipleToCloudinary, validateFile } from '@/lib/cloudinary'

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
      const filesToUpload = Array.from(files)
      
      // Validate all files first
      for (const file of filesToUpload) {
        const validation = validateFile(file, 'image')
        if (!validation.valid) {
          throw new Error(validation.error)
        }
      }

      // Upload to Cloudinary
      const uploadedUrls = await uploadMultipleToCloudinary(
        filesToUpload,
        'post-media',
        (fileIndex, progress) => {
          console.log(`Uploading file ${fileIndex + 1}: ${progress.percentage}%`)
        }
      )

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 sm:mx-0 bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col lg:max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <h2 className="text-base font-semibold" style={{ color: '#111827' }}>Create new post</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: '#6B7280' }} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                    border: '2px solid #F3F4F6'
                  }}
                >
                  <span className="text-white text-sm font-semibold">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {user.username}
                  </div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Panel Type Selector */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPanelType('NATIONAL')}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: panelType === 'NATIONAL' ? '#3B82F6' : '#F3F4F6',
                    color: panelType === 'NATIONAL' ? 'white' : '#374151',
                    boxShadow: panelType === 'NATIONAL' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                >
                  🌍 National
                </button>
                <button
                  onClick={() => setPanelType('COLLEGE')}
                  disabled={!canPostToCollege}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: panelType === 'COLLEGE' ? '#3B82F6' : (canPostToCollege ? '#F3F4F6' : '#F9FAFB'),
                    color: panelType === 'COLLEGE' ? 'white' : (canPostToCollege ? '#374151' : '#9CA3AF'),
                    boxShadow: panelType === 'COLLEGE' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                    cursor: canPostToCollege ? 'pointer' : 'not-allowed'
                  }}
                >
                  🏛️ College
                  {!canPostToCollege && ' 🔒'}
                </button>
              </div>

              {/* Info Message */}
              {panelType === 'COLLEGE' && canPostToCollege && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800"
                >
                  📢 Visible only to your college members
                </motion.div>
              )}

              {panelType === 'NATIONAL' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800"
                >
                  🌐 Visible to everyone on the national portal
                </motion.div>
              )}

              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title (optional)"
                className="w-full px-4 py-2.5 mb-3 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  color: '#111827'
                }}
                maxLength={200}
              />

              {/* Content Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none transition-all duration-200"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  color: '#111827'
                }}
                rows={6}
                maxLength={5000}
              />

              {/* Character Count */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>
                  {content.length > 0 && `${content.length}/5000 characters`}
                </span>
                {content.length > 4500 && (
                  <span className="text-xs font-medium" style={{ color: '#F97316' }}>
                    {5000 - content.length} characters left
                  </span>
                )}
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2"
                >
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group aspect-square"
                    >
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Image number indicator */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-2">
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
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    title={images.length >= 5 ? 'Maximum 5 images' : 'Add images'}
                  >
                    {uploadingImage ? (
                      <Upload className="w-5 h-5 animate-pulse" style={{ color: '#3B82F6' }} />
                    ) : (
                      <ImageIcon className="w-5 h-5 group-hover:text-[#3B82F6] transition-colors" style={{ color: '#6B7280' }} />
                    )}
                  </button>
                  <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
                    {images.length}/5
                  </span>
                </div>
                {uploadingImage && (
                  <span className="text-xs font-medium animate-pulse" style={{ color: '#3B82F6' }}>
                    Uploading...
                  </span>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3" style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50"
                style={{ color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading || uploadingImage}
                className="px-6 py-2 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  background: !content.trim() || loading || uploadingImage 
                    ? '#9CA3AF' 
                    : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
