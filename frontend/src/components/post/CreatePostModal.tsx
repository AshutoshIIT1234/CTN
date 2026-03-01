'use client'

import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Sparkles, Upload, Trash2, Globe, GraduationCap, ChevronDown } from 'lucide-react'
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

  const canPostToCollege = user && (
    user.role === 'COLLEGE_USER' ||
    user.role === 'MODERATOR' ||
    user.role === 'ADMIN'
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

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
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      alert('Please enter a title (Thesis) for your thought')
      return
    }

    if (trimmedTitle.length < 3) {
      alert('Title must be at least 3 characters long.')
      return
    }

    if (!trimmedContent) {
      alert('Please enter some content for your thought')
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

      setTitle('')
      setContent('')
      setImages([])
      setPanelType('NATIONAL')
      onPostCreated?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to create post:', error)
      alert('Failed to post thought. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-dark-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Elegant Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 dark:border-dark-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-dark-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1E293B] dark:text-white">Broadcast Thought</h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Intellectual Network</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-dark-800 transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-8 overflow-y-auto hide-scrollbar">
              {/* Publisher Identity */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600">
                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-dark-900 flex items-center justify-center text-blue-600 font-black text-lg">
                      {user.username[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#1E293B] dark:text-white">Authoring as @{user.username}</span>
                    <span className="text-[11px] font-bold text-green-500 uppercase tracking-tighter">Verified Thinker</span>
                  </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-dark-800 p-1 rounded-2xl">
                  <button
                    onClick={() => setPanelType('NATIONAL')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${panelType === 'NATIONAL' ? 'bg-white dark:bg-dark-900 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>National</span>
                  </button>
                  <button
                    onClick={() => setPanelType('COLLEGE')}
                    disabled={!canPostToCollege}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${panelType === 'COLLEGE' ? 'bg-white dark:bg-dark-900 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600 disabled:opacity-30'
                      }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Institutional</span>
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Core Thesis (Required)"
                  className="w-full bg-slate-50/50 dark:bg-dark-800/50 border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1E293B] dark:text-white placeholder:text-slate-300 focus:ring-2 ring-blue-100 dark:ring-blue-900/20 transition-all outline-none"
                />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Formulate your thought here..."
                  className="w-full bg-slate-50/50 dark:bg-dark-800/50 border-0 rounded-[24px] px-6 py-5 text-base leading-relaxed text-[#334155] dark:text-slate-300 placeholder:text-slate-300 focus:ring-2 ring-blue-100 dark:ring-blue-900/20 transition-all outline-none resize-none"
                  rows={8}
                />
              </div>

              {/* Image Previews */}
              <AnimatePresence>
                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 grid grid-cols-5 gap-3"
                  >
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img src={image} className="w-full h-full object-cover rounded-2xl shadow-md" alt="" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer with Actions */}
            <div className="px-8 py-6 bg-slate-50/50 dark:bg-dark-800/50 backdrop-blur-sm border-t border-slate-50 dark:border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || images.length >= 5}
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{images.length}/5 Media</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading || uploadingImage}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[20px] text-sm font-black shadow-xl shadow-blue-200/50 hover:shadow-blue-300 transition-all disabled:opacity-30 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Publishing...' : 'Publish Thought'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

