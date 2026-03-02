'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, Upload, Trash2, Send, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { uploadMultipleToCloudinary, validateFile } from '@/lib/cloudinary'
import { useQueryClient } from '@tanstack/react-query'

export const dynamic = 'force-dynamic'

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [panelType, setPanelType] = useState<'NATIONAL' | 'COLLEGE'>('NATIONAL')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login')
    return null
  }

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
      for (const file of filesToUpload) {
        const validation = validateFile(file, 'image')
        if (!validation.valid) throw new Error(validation.error)
      }

      const uploadedUrls = await uploadMultipleToCloudinary(
        filesToUpload,
        'post-media'
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
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      alert('Please enter a title for your post')
      return
    }

    if (trimmedTitle.length < 3) {
      alert('Title must be at least 3 characters long.')
      return
    }

    if (!trimmedContent) {
      alert('Please enter some content for your post')
      return
    }

    if (panelType === 'COLLEGE' && !canPostToCollege) {
      alert('You need to be a college user to post to the college panel')
      return
    }

    setLoading(true)
    try {
      await api.post('/posts', {
        title: trimmedTitle,
        content: trimmedContent,
        panelType,
        imageUrls: images.length > 0 ? images : undefined
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['national-feed'] })
      if (user?.collegeId) {
        queryClient.invalidateQueries({ queryKey: ['college-feed'] })
      }

      // Navigate to appropriate feed
      if (panelType === 'COLLEGE') {
        router.push('/college')
      } else {
        router.push('/')
      }
    } catch (error: any) {
      console.error('Failed to create post:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create post. Please try again.'
      alert(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <div className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h1>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading || uploadingImage}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Broadcasting...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Broadcast
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-800 p-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-base font-semibold text-gray-900 dark:text-white">
                {user.username}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {user.email}
              </div>
            </div>
          </div>

          {/* Panel Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Post to:
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setPanelType('NATIONAL')}
                className={`flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all ${panelType === 'NATIONAL'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
              >
                🌍 National Portal
              </button>
              <button
                onClick={() => setPanelType('COLLEGE')}
                disabled={!canPostToCollege}
                className={`flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all ${panelType === 'COLLEGE'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                    : canPostToCollege
                      ? 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                      : 'bg-gray-50 dark:bg-dark-800/50 text-gray-400 cursor-not-allowed'
                  }`}
              >
                🏛️ College Portal
                {!canPostToCollege && ' 🔒'}
              </button>
            </div>
          </div>

          {/* Info Message */}
          {panelType === 'COLLEGE' && canPostToCollege && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300"
            >
              📢 This post will be visible only to members of your college
            </motion.div>
          )}

          {panelType === 'NATIONAL' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-800 dark:text-green-300"
            >
              🌐 This post will be visible to everyone on the national portal
            </motion.div>
          )}

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thought a title..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {title.length}/200
            </div>
          </div>

          {/* Content Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Formulate your logic here..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
              rows={8}
              maxLength={5000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/5000
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Media (optional)
            </label>

            {/* Upload Button */}
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
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-dark-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-gray-600 dark:text-slate-400"
            >
              {uploadingImage ? (
                <>
                  <Upload className="w-5 h-5 animate-pulse" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>
                    {images.length >= 5
                      ? 'Maximum 5 images reached'
                      : `Add images (${images.length}/5)`}
                  </span>
                </>
              )}
            </button>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              💡 Guidelines for Broadcast:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
              <li>• Maintain intellectual integrity in your thesis</li>
              <li>• Add supporting media for visual clarity</li>
              <li>• Choose the appropriate portal for dissemination</li>
              <li>• Follow the global network standards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
