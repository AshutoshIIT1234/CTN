'use client'

import { useState, useRef, useEffect } from 'react'
import {
  X,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Globe,
  GraduationCap,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import api from '@/lib/api'
import { uploadMultipleToCloudinary, validateFile } from '@/lib/cloudinary'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [panelType, setPanelType] = useState<'NATIONAL' | 'COLLEGE'>('NATIONAL')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragControls = useDragControls()

  const canPostToCollege =
    user &&
    (user.role === 'COLLEGE_USER' ||
      user.role === 'MODERATOR' ||
      user.role === 'ADMIN')

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Lock scroll on body when modal open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      /* Auto-focus textarea on open */
      setTimeout(() => textareaRef.current?.focus(), 350)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  /* Reset form when closed */
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setContent('')
      setImages([])
      setPanelType('NATIONAL')
    }
  }, [isOpen])

  /* Auto-grow textarea */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      alert('Maximum 5 images per post')
      return
    }

    setUploadingImage(true)
    try {
      const filesToUpload = Array.from(files)
      for (const file of filesToUpload) {
        const validation = validateFile(file, 'image')
        if (!validation.valid) throw new Error(validation.error)
      }
      const uploadedUrls = await uploadMultipleToCloudinary(filesToUpload, 'post-media')
      setImages((prev) => [...prev, ...uploadedUrls])
    } catch (error: any) {
      alert(error.message || 'Failed to upload images')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      alert('Please enter a title for your thought')
      return
    }
    if (trimmedTitle.length < 3) {
      alert('Title must be at least 3 characters')
      return
    }
    if (!trimmedContent) {
      alert('Please enter content for your thought')
      return
    }
    if (panelType === 'COLLEGE' && !canPostToCollege) {
      alert('You need a college account to post here')
      return
    }

    setLoading(true)
    try {
      await api.post('/posts', {
        title: trimmedTitle,
        content: trimmedContent,
        panelType,
        imageUrls: images.length > 0 ? images : undefined,
      })
      onPostCreated?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to create post:', error)
      alert('Failed to publish. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = title.trim().length >= 3 && content.trim().length > 0 && !loading && !uploadingImage

  if (!user) return null

  /* ─────────────────────────────────────────────────────────────
     MOBILE: Bottom Sheet
  ───────────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 500) {
                  onClose()
                }
              }}
              className="relative z-10 bg-white dark:bg-dark-900 flex flex-col"
              style={{
                borderRadius: '28px 28px 0 0',
                maxHeight: '92dvh',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {/* Drag handle */}
              <div
                className="flex-shrink-0 flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-dark-800 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-dark-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="w-4 h-4" />
                </button>

                <h2 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">
                  New Thought
                </h2>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-4 py-2 rounded-xl text-[13px] font-black text-white transition-all disabled:opacity-40"
                  style={{
                    background: canSubmit
                      ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
                      : '#CBD5E1',
                    touchAction: 'manipulation',
                    boxShadow: canSubmit ? '0 4px 14px rgba(59,130,246,0.4)' : 'none',
                  }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Post'
                  )}
                </motion.button>
              </div>

              {/* Author row + panel toggle */}
              <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow"
                  style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt=""
                      className="w-full h-full rounded-[12px] object-cover"
                    />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>

                {/* Name + panel */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-slate-900 dark:text-white leading-none truncate">
                    {user.displayName || user.username}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      onClick={() => setPanelType('NATIONAL')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                        panelType === 'NATIONAL'
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-50 dark:bg-dark-800 text-slate-400'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Globe className="w-3 h-3" />
                      National
                    </button>
                    {canPostToCollege && (
                      <button
                        onClick={() => setPanelType('COLLEGE')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                          panelType === 'COLLEGE'
                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-50 dark:bg-dark-800 text-slate-400'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <GraduationCap className="w-3 h-3" />
                        College
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div
                className="flex-1 overflow-y-auto px-5"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (required)"
                  className="w-full bg-transparent border-none outline-none text-[17px] font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 mb-3"
                  style={{ fontSize: 17 }}
                  maxLength={120}
                />

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-dark-800 mb-3" />

                {/* Content textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent border-none outline-none text-[15px] text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none leading-relaxed"
                  style={{ fontSize: 15, minHeight: 120 }}
                  rows={5}
                />

                {/* Image previews */}
                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 grid grid-cols-3 gap-2 pb-4"
                    >
                      {images.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative aspect-square group"
                        >
                          <img
                            src={image}
                            className="w-full h-full object-cover rounded-2xl"
                            alt=""
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center"
                            style={{ touchAction: 'manipulation' }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload loading */}
                {uploadingImage && (
                  <div className="flex items-center gap-3 py-4 text-slate-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] font-medium">Uploading…</span>
                  </div>
                )}

                {/* Bottom spacer */}
                <div className="h-4" />
              </div>

              {/* Toolbar */}
              <div
                className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-t border-slate-100 dark:border-dark-800"
                style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
              >
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || images.length >= 5}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-800 text-slate-500 dark:text-slate-400 disabled:opacity-30"
                  style={{ touchAction: 'manipulation' }}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-[12px] font-black uppercase tracking-wider">
                    Photo {images.length > 0 ? `${images.length}/5` : ''}
                  </span>
                </motion.button>

                <div className="flex-1" />

                {/* Character count */}
                {content.length > 0 && (
                  <span
                    className={`text-[11px] font-bold ${
                      content.length > 900
                        ? 'text-red-500'
                        : content.length > 700
                        ? 'text-amber-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {content.length}
                  </span>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  /* ─────────────────────────────────────────────────────────────
     DESKTOP: Centered Modal
  ───────────────────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-dark-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50 dark:border-dark-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-dark-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Broadcast Thought
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Global Intellectual Network
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-dark-800 transition-all text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Author + Panel Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                  >
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      @{user.username}
                    </p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                      Verified Thinker
                    </p>
                  </div>
                </div>

                {/* Panel toggle */}
                <div className="flex bg-slate-100 dark:bg-dark-800 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setPanelType('NATIONAL')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      panelType === 'NATIONAL'
                        ? 'bg-white dark:bg-dark-900 shadow-sm text-blue-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    National
                  </button>
                  <button
                    onClick={() => setPanelType('COLLEGE')}
                    disabled={!canPostToCollege}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-30 ${
                      panelType === 'COLLEGE'
                        ? 'bg-white dark:bg-dark-900 shadow-sm text-indigo-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    College
                  </button>
                </div>
              </div>

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Core Thesis (Required)"
                className="w-full bg-slate-50/50 dark:bg-dark-800/50 border-0 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:ring-2 ring-blue-100 dark:ring-blue-900/20 transition-all outline-none mb-4"
                style={{ fontSize: 15 }}
                maxLength={120}
              />

              {/* Content */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Formulate your thought here…"
                className="w-full bg-slate-50/50 dark:bg-dark-800/50 border-0 rounded-2xl px-5 py-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-300 focus:ring-2 ring-blue-100 dark:ring-blue-900/20 transition-all outline-none resize-none"
                rows={7}
              />

              {/* Image Previews */}
              <AnimatePresence>
                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 grid grid-cols-5 gap-2"
                  >
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={image}
                          className="w-full h-full object-cover rounded-2xl shadow-md"
                          alt=""
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50/50 dark:bg-dark-800/50 border-t border-slate-50 dark:border-dark-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || images.length >= 5}
                  className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-center">
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">
                    {images.length}/5
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Discard
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-7 py-3.5 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-200/50 transition-all disabled:opacity-30 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
                  }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Publishing…' : 'Publish'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
