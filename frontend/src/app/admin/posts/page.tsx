'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, UserRole } from '@/store/authStore'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Flag, 
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Heart,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPostsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPanel, setFilterPanel] = useState<'ALL' | 'NATIONAL' | 'COLLEGE'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [colleges, setColleges] = useState<any[]>([])

  // Create Post State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [panelType, setPanelType] = useState<'NATIONAL' | 'COLLEGE'>('NATIONAL')
  const [selectedCollege, setSelectedCollege] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [creating, setCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user?.role !== UserRole.ADMIN) {
      router.push('/feed')
      return
    }

    fetchPosts()
    fetchColleges()
  }, [isAuthenticated, user, router])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/posts/admin/all', {
        params: {
          page: 1,
          limit: 50,
          includeDeleted: false,
          includeHidden: true
        }
      })
      setPosts(response.data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges')
      setColleges(response.data || [])
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
    }
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
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Max 5MB.`)
        }

        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image.`)
        }

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

  const handleCreatePost = async () => {
    if (!content.trim()) {
      alert('Please enter content')
      return
    }

    if (panelType === 'COLLEGE' && !selectedCollege) {
      alert('Please select a college')
      return
    }

    setCreating(true)
    try {
      await api.post('/posts/admin/create', {
        title: title.trim() || undefined,
        content: content.trim(),
        panelType,
        collegeId: panelType === 'COLLEGE' ? selectedCollege : undefined,
        imageUrls: images.length > 0 ? images : undefined
      })

      // Reset form
      setTitle('')
      setContent('')
      setImages([])
      setSelectedCollege('')
      setPanelType('NATIONAL')
      setShowCreateModal(false)

      // Refresh posts
      fetchPosts()
      alert('Post created successfully!')
    } catch (error: any) {
      console.error('Failed to create post:', error)
      alert(error.response?.data?.message || 'Failed to create post')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await api.delete(`/posts/admin/${postId}`)
      fetchPosts()
      alert('Post deleted successfully')
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const handleToggleHide = async (postId: string) => {
    try {
      await api.post(`/posts/admin/${postId}/hide`)
      fetchPosts()
    } catch (error) {
      console.error('Failed to toggle hide:', error)
      alert('Failed to update post')
    }
  }

  const handleToggleFlag = async (postId: string) => {
    const reason = prompt('Enter flag reason (optional):')
    try {
      await api.post(`/posts/admin/${postId}/flag`, { reason })
      fetchPosts()
    } catch (error) {
      console.error('Failed to toggle flag:', error)
      alert('Failed to update post')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterPanel === 'ALL' || post.panelType === filterPanel

    return matchesSearch && matchesFilter
  })

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
              <p className="text-gray-600">Create and manage posts across all portals</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>

            {/* Panel Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterPanel('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterPanel === 'ALL'
                    ? 'bg-royal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPanel('NATIONAL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterPanel === 'NATIONAL'
                    ? 'bg-royal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                National
              </button>
              <button
                onClick={() => setFilterPanel('COLLEGE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterPanel === 'COLLEGE'
                    ? 'bg-royal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                College
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-royal-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600">No posts found</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-xl border p-6 ${
                  post.isHidden ? 'border-yellow-400 bg-yellow-50' :
                  post.isFlagged ? 'border-red-400 bg-red-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        post.panelType === 'NATIONAL'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {post.panelType}
                      </span>
                      {post.isHidden && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                          Hidden
                        </span>
                      )}
                      {post.isFlagged && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      By @{post.authorUsername} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleHide(post.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={post.isHidden ? 'Unhide' : 'Hide'}
                    >
                      {post.isHidden ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-yellow-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleFlag(post.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={post.isFlagged ? 'Unflag' : 'Flag'}
                    >
                      <Flag className={`w-5 h-5 ${post.isFlagged ? 'text-red-600 fill-red-600' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {post.title && (
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                )}
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {post.content}
                </p>

                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {post.imageUrls.slice(0, 4).map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Post image ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>❤️ {post.likes} likes</span>
                  <span>💬 {post.commentCount} comments</span>
                  {post.reportCount > 0 && (
                    <span className="text-red-600">🚩 {post.reportCount} reports</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="fixed inset-0 bg-black/60 z-50"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-semibold text-gray-900">Create Admin Post</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Panel Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post to:
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPanelType('NATIONAL')}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          panelType === 'NATIONAL'
                            ? 'bg-royal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🌍 National Portal
                      </button>
                      <button
                        onClick={() => setPanelType('COLLEGE')}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          panelType === 'COLLEGE'
                            ? 'bg-royal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        🏛️ College Portal
                      </button>
                    </div>
                  </div>

                  {/* College Selector */}
                  {panelType === 'COLLEGE' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select College:
                      </label>
                      <select
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                      >
                        <option value="">Choose a college...</option>
                        {colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Post title..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500"
                      maxLength={200}
                    />
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 resize-none"
                      rows={6}
                      maxLength={5000}
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {content.length}/5000
                    </div>
                  </div>

                  {/* Images */}
                  {images.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2">
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
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-royal-400 hover:bg-royal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-gray-600 mb-4"
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
                            ? 'Maximum 5 images' 
                            : `Add images (${images.length}/5)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!content.trim() || creating || uploadingImage}
                    className="px-6 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {creating ? 'Creating...' : 'Create Post'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  )
}
