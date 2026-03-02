'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  Flag,
  Trash2,
  Plus,
  BookOpen,
  Users,
  Calendar,
  User,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { MainLayout } from '@/components/layout/MainLayout'
import { api } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadToCloudinary, validateFile } from '@/lib/cloudinary'

/* ── Interfaces ────────────────────────────────────────────── */
interface Resource {
  id: string
  fileName: string
  resourceType: string
  department: string
  batch: string
  description: string
  uploadDate: string
  college: { id: string; name: string }
  uploader: { id: string; username: string }
}

interface CollegeUser {
  id: string
  email: string
  username: string
  displayName: string
  role: UserRole
  createdAt: string
}

interface CollegePost {
  id: string
  title: string
  content: string
  author: { id: string; username: string; displayName: string }
  createdAt: string
  isFlagged: boolean
  isHidden: boolean
  flagReason?: string
  _count: { likes: number; comments: number }
}

const RESOURCE_TYPES = [
  'TOPPER_NOTES',
  'PREVIOUS_YEAR_PAPERS',
  'STUDY_MATERIALS',
  'ASSIGNMENTS',
  'PROJECTS',
]

/* ── Field wrapper ─────────────────────────────────────────── */
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-[14px] text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500 transition-all'

/* ── Loading Spinner ───────────────────────────────────────── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

/* ── Empty State ───────────────────────────────────────────── */
function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-slate-50 dark:bg-dark-800 rounded-3xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-200 dark:text-slate-700" />
      </div>
      <p className="text-[14px] font-black text-slate-900 dark:text-white tracking-tight mb-1">
        {title}
      </p>
      {subtitle && (
        <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium max-w-[220px]">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ModeratorDashboard() {
  const router = useRouter()
  const { user, college } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<
    'upload' | 'moderation' | 'my-uploads' | 'users'
  >('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const [uploadForm, setUploadForm] = useState({
    resourceType: '',
    department: '',
    batch: '',
    fileName: '',
    fileUrl: '',
    description: '',
  })

  useEffect(() => {
    if (!user || user.role !== UserRole.MODERATOR) router.push('/')
  }, [user, router])

  /* ── Queries ────────────────────────────────────────────── */
  const { data: myResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['my-uploads'],
    queryFn: async () => {
      const r = await api.get('/resources/my-uploads')
      return r.data.resources as Resource[]
    },
    enabled: !!user && user.role === UserRole.MODERATOR,
  })

  const { data: collegeUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['college-users', college?.id],
    queryFn: async () => {
      if (!college?.id) return []
      const r = await api
        .get(`/moderators/college/${college.id}/users`)
        .catch(() => null)
      return (r?.data?.users as CollegeUser[]) || []
    },
    enabled: !!college?.id && !!user && user.role === UserRole.MODERATOR,
  })

  const { data: collegePosts, isLoading: postsLoading } = useQuery({
    queryKey: ['college-posts', college?.id],
    queryFn: async () => {
      if (!college?.id) return []
      const r = await api.get(`/posts/college/${college.id}`)
      return r.data.posts as CollegePost[]
    },
    enabled: !!college?.id && !!user && user.role === UserRole.MODERATOR,
  })

  /* ── Mutations ──────────────────────────────────────────── */
  const uploadMutation = useMutation({
    mutationFn: async (data: typeof uploadForm) => {
      if (!college?.id) throw new Error('No college assigned')
      return (await api.post(`/resources/upload/${college.id}`, data)).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-uploads'] })
      setUploadForm({
        resourceType: '',
        department: '',
        batch: '',
        fileName: '',
        fileUrl: '',
        description: '',
      })
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2500)
    },
  })

  const flagPostMutation = useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) =>
      (await api.post(`/posts/${postId}/flag`, { reason })).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['college-posts'] }),
  })

  const hidePostMutation = useMutation({
    mutationFn: async (postId: string) =>
      (await api.post(`/posts/${postId}/hide`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['college-posts'] }),
  })

  const unhidePostMutation = useMutation({
    mutationFn: async (postId: string) =>
      (await api.post(`/posts/${postId}/unhide`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['college-posts'] }),
  })

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: string) =>
      (await api.delete(`/resources/${resourceId}`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['my-uploads'] }),
  })

  /* ── Handlers ───────────────────────────────────────────── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateFile(file, 'document')
    if (!validation.valid) {
      alert(validation.error || 'Invalid file')
      return
    }
    setUploadingFile(true)
    try {
      const url = await uploadToCloudinary(file, 'resource')
      setUploadForm((prev) => ({ ...prev, fileName: file.name, fileUrl: url }))
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !uploadForm.resourceType ||
      !uploadForm.department ||
      !uploadForm.batch ||
      !uploadForm.fileName ||
      !uploadForm.fileUrl
    )
      return
    uploadMutation.mutate(uploadForm)
  }

  if (!user || user.role !== UserRole.MODERATOR) return null

  /* ── Tab definitions ──────────────────────────────────────── */
  const tabs = [
    {
      id: 'upload' as const,
      label: 'Upload',
      icon: Upload,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'moderation' as const,
      label: 'Moderate',
      icon: Flag,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: 'my-uploads' as const,
      label: 'My Files',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'users' as const,
      label: 'Users',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
    },
  ]

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950">

        {/* ── Sticky header ───────────────────────────────── */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-4"
          style={{
            height: 52,
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(226,232,240,0.5)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shadow"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
            >
              <Flag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">
              Mod Hub
            </span>
          </div>

          {college?.name && (
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate max-w-[160px]">
              {college.name}
            </span>
          )}
        </div>

        {/* ── Tab bar ─────────────────────────────────────── */}
        <div
          className="flex bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 overflow-x-auto hide-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 min-w-[72px] flex flex-col items-center gap-1 py-3 px-2 relative transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-br ${tab.gradient} shadow-md`
                      : 'bg-slate-50 dark:bg-dark-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="modTabLine"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Tab content ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="px-3 py-4 pb-nav md:px-6"
          >

            {/* ════════════════════════════════
                UPLOAD TAB
            ════════════════════════════════ */}
            {activeTab === 'upload' && (
              <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800 shadow-sm overflow-hidden">

                {/* Card header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-50 dark:border-dark-800">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
                    style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                  >
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 dark:text-white leading-none">
                      Upload Resource
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Share study materials with your college
                    </p>
                  </div>
                </div>

                {/* Success banner */}
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/20">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                          Resource uploaded successfully!
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleUploadSubmit} className="p-4 space-y-4">

                  {/* Row 1: Resource Type + Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Resource Type">
                      <select
                        value={uploadForm.resourceType}
                        onChange={(e) =>
                          setUploadForm((p) => ({ ...p, resourceType: e.target.value }))
                        }
                        className={inputCls}
                        required
                        style={{ fontSize: 14 }}
                      >
                        <option value="">Select type…</option>
                        {RESOURCE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Department">
                      <input
                        type="text"
                        value={uploadForm.department}
                        onChange={(e) =>
                          setUploadForm((p) => ({ ...p, department: e.target.value }))
                        }
                        placeholder="e.g. Computer Science"
                        className={inputCls}
                        required
                        style={{ fontSize: 14 }}
                      />
                    </Field>
                  </div>

                  {/* Row 2: Batch + File name (readonly) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Batch">
                      <input
                        type="text"
                        value={uploadForm.batch}
                        onChange={(e) =>
                          setUploadForm((p) => ({ ...p, batch: e.target.value }))
                        }
                        placeholder="e.g. 2024 / Batch A"
                        className={inputCls}
                        required
                        style={{ fontSize: 14 }}
                      />
                    </Field>

                    <Field label="File Name">
                      <input
                        type="text"
                        value={uploadForm.fileName}
                        placeholder="Auto-filled after upload"
                        className={`${inputCls} opacity-60`}
                        readOnly
                        style={{ fontSize: 14 }}
                      />
                    </Field>
                  </div>

                  {/* File picker */}
                  <Field label="Upload File">
                    <div className="flex gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-dark-700 text-slate-500 dark:text-slate-400 font-bold text-[13px] hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-40"
                        style={{ touchAction: 'manipulation' }}
                      >
                        {uploadingFile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {uploadForm.fileUrl ? 'Replace File' : 'Choose File'}
                          </>
                        )}
                      </motion.button>

                      {uploadForm.fileUrl && (
                        <a
                          href={uploadForm.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-[13px] hover:bg-emerald-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      PDF, DOC, DOCX, PPT, PPTX, Images — max 50 MB
                    </p>
                  </Field>

                  {/* Description */}
                  <Field label="Description (Optional)">
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Brief description of the resource…"
                      rows={3}
                      className={`${inputCls} resize-none`}
                      style={{ fontSize: 14 }}
                    />
                  </Field>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={
                      uploadMutation.isPending ||
                      !uploadForm.resourceType ||
                      !uploadForm.department ||
                      !uploadForm.batch ||
                      !uploadForm.fileUrl
                    }
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-[14px] uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all"
                    style={{
                      background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
                      touchAction: 'manipulation',
                    }}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Resource
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            )}

            {/* ════════════════════════════════
                MODERATION TAB
            ════════════════════════════════ */}
            {activeTab === 'moderation' && (
              <div className="space-y-3">
                {/* Section header */}
                <div className="flex items-center gap-3 px-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#F97316,#EF4444)' }}
                  >
                    <Flag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 dark:text-white leading-none">
                      College Posts
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Flag or hide inappropriate content
                    </p>
                  </div>
                </div>

                {postsLoading ? (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                    <Spinner />
                  </div>
                ) : collegePosts && collegePosts.length > 0 ? (
                  <div className="space-y-3">
                    {collegePosts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout
                        className={`bg-white dark:bg-dark-900 rounded-2xl border shadow-sm overflow-hidden ${
                          post.isFlagged
                            ? 'border-red-200 dark:border-red-800/40'
                            : post.isHidden
                            ? 'border-amber-200 dark:border-amber-800/40 opacity-70'
                            : 'border-slate-100 dark:border-dark-800'
                        }`}
                      >
                        {/* Post header */}
                        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                          >
                            {post.author.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-slate-900 dark:text-white truncate">
                              @{post.author.username}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {new Date(post.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          {/* Status badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {post.isFlagged && (
                              <span className="px-2 py-0.5 text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full uppercase tracking-wider">
                                Flagged
                              </span>
                            )}
                            {post.isHidden && (
                              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full uppercase tracking-wider">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Post content */}
                        <div className="px-4 pb-3">
                          {post.title && (
                            <h3 className="text-[14px] font-black text-slate-900 dark:text-white mb-1 leading-snug">
                              {post.title}
                            </h3>
                          )}
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {post.content}
                          </p>
                          {post.flagReason && (
                            <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                              <p className="text-[12px] text-red-600 dark:text-red-400 font-bold">
                                Flag reason: {post.flagReason}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400">
                            <span>{post._count.likes} likes</span>
                            <span>·</span>
                            <span>{post._count.comments} comments</span>
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="flex border-t border-slate-50 dark:border-dark-800">
                          {!post.isFlagged && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter flag reason:')
                                if (reason)
                                  flagPostMutation.mutate({ postId: post.id, reason })
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <Flag className="w-3.5 h-3.5" />
                              Flag
                            </button>
                          )}

                          {!post.isHidden ? (
                            <button
                              onClick={() => hidePostMutation.mutate(post.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-black text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors uppercase tracking-wider border-l border-slate-50 dark:border-dark-800"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              Hide
                            </button>
                          ) : (
                            <button
                              onClick={() => unhidePostMutation.mutate(post.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-black text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors uppercase tracking-wider border-l border-slate-50 dark:border-dark-800"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Unhide
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                    <EmptyState
                      icon={Flag}
                      title="No posts to moderate"
                      subtitle="All college posts are currently clean."
                    />
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════
                MY FILES TAB
            ════════════════════════════════ */}
            {activeTab === 'my-uploads' && (
              <div>
                {/* Section header */}
                <div className="flex items-center justify-between px-1 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#10B981,#14B8A6)' }}
                    >
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-black text-slate-900 dark:text-white leading-none">
                        My Uploads
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {myResources?.length ?? 0} resource{myResources?.length !== 1 ? 's' : ''} uploaded
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveTab('upload')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Upload
                  </motion.button>
                </div>

                {resourcesLoading ? (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                    <Spinner />
                  </div>
                ) : myResources && myResources.length > 0 ? (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800 shadow-sm overflow-hidden">
                    {myResources.map((resource, i) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 px-4 py-4 border-b border-slate-50 dark:border-dark-800 last:border-b-0"
                      >
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-slate-900 dark:text-white truncate leading-none mb-1">
                            {resource.fileName}
                          </p>
                          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                            {resource.resourceType.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {resource.department}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {resource.batch}
                            </span>
                          </div>
                          {resource.description && (
                            <p className="text-[12px] text-slate-400 mt-1 line-clamp-2">
                              {resource.description}
                            </p>
                          )}
                        </div>

                        {/* Delete */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => {
                            if (confirm('Delete this resource?')) {
                              deleteResourceMutation.mutate(resource.id)
                            }
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
                          style={{ touchAction: 'manipulation' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                    <EmptyState
                      icon={FileText}
                      title="No uploads yet"
                      subtitle="Share study materials with your college peers."
                      action={
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setActiveTab('upload')}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-black text-white shadow-lg shadow-blue-500/20"
                          style={{
                            background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
                            touchAction: 'manipulation',
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Upload First Resource
                        </motion.button>
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════
                USERS TAB
            ════════════════════════════════ */}
            {activeTab === 'users' && (
              <div>
                {/* Section header */}
                <div className="flex items-center gap-3 px-1 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 dark:text-white leading-none">
                      College Users
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {college?.name ?? 'Your college'} members
                    </p>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                    <Spinner />
                  </div>
                ) : collegeUsers && collegeUsers.length > 0 ? (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800 shadow-sm overflow-hidden">
                    {collegeUsers.map((usr, i) => (
                      <motion.div
                        key={usr.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-dark-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors"
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)' }}
                        >
                          {usr.username[0]?.toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-slate-900 dark:text-white truncate leading-none mb-0.5">
                            {usr.displayName || usr.username}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 truncate">
                            {usr.email}
                          </p>
                        </div>

                        {/* Role badge */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 text-[10px] font-black bg-slate-50 dark:bg-dark-800 text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-wider">
                            {usr.role.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600">
                            {new Date(usr.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      subtitle="College user data will appear here once available."
                    />
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}
