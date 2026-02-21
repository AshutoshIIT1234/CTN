'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, UserRole } from '@/store/authStore'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Building, 
  Edit, 
  Trash2,
  X,
  Users,
  Mail
} from 'lucide-react'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminCollegesPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState<any>(null)

  // Form state
  const [name, setName] = useState('')
  const [emailDomain, setEmailDomain] = useState('')
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user?.role !== UserRole.ADMIN) {
      router.push('/')
      return
    }

    fetchColleges()
  }, [isAuthenticated, user, router])

  const fetchColleges = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/colleges')
      setColleges(response.data || [])
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollege = async () => {
    if (!name.trim() || !emailDomain.trim()) {
      alert('Please fill in all fields')
      return
    }

    setCreating(true)
    try {
      await api.post('/admin/colleges', {
        name: name.trim(),
        emailDomain: emailDomain.trim().toLowerCase()
      })

      setName('')
      setEmailDomain('')
      setShowCreateModal(false)
      fetchColleges()
      alert('College created successfully!')
    } catch (error: any) {
      console.error('Failed to create college:', error)
      alert(error.response?.data?.message || 'Failed to create college')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateCollege = async () => {
    if (!name.trim() || !emailDomain.trim()) {
      alert('Please fill in all fields')
      return
    }

    setUpdating(true)
    try {
      await api.put(`/admin/colleges/${selectedCollege.id}`, {
        name: name.trim(),
        emailDomain: emailDomain.trim().toLowerCase()
      })

      setName('')
      setEmailDomain('')
      setSelectedCollege(null)
      setShowEditModal(false)
      fetchColleges()
      alert('College updated successfully!')
    } catch (error: any) {
      console.error('Failed to update college:', error)
      alert(error.response?.data?.message || 'Failed to update college')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCollege = async (collegeId: string, collegeName: string) => {
    if (!confirm(`Are you sure you want to delete "${collegeName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/admin/colleges/${collegeId}`)
      fetchColleges()
      alert('College deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete college:', error)
      alert(error.response?.data?.message || 'Failed to delete college')
    }
  }

  const openEditModal = (college: any) => {
    setSelectedCollege(college)
    setName(college.name)
    setEmailDomain(college.emailDomain)
    setShowEditModal(true)
  }

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.emailDomain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <InstagramLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-dark-900 z-10 py-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Colleges</h1>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold text-sm shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search colleges..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 text-sm"
            />
          </div>
        </div>

        {/* Colleges List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-royal-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">Loading colleges...</p>
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-700">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">No colleges found</p>
            </div>
          ) : (
            filteredColleges.map((college) => (
              <div
                key={college.id}
                className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-700 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {college.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">@{college.emailDomain}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {college.userCount || 0} users
                        </span>
                        <span>
                          {college.postCount || 0} posts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(college)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteCollege(college.id, college.name)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
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
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-700">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add College</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Harvard University"
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Domain
                    </label>
                    <input
                      type="text"
                      value={emailDomain}
                      onChange={(e) => setEmailDomain(e.target.value)}
                      placeholder="e.g., harvard.edu"
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Users with this email domain can access this college portal
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 dark:border-dark-700">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCollege}
                    disabled={!name.trim() || !emailDomain.trim() || creating}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-lg"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedCollege && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
                className="fixed inset-0 bg-black/60 z-50"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-700">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit College</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Harvard University"
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-sm"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Domain
                    </label>
                    <input
                      type="text"
                      value={emailDomain}
                      onChange={(e) => setEmailDomain(e.target.value)}
                      placeholder="e.g., harvard.edu"
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 dark:border-dark-700">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-colors font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCollege}
                    disabled={!name.trim() || !emailDomain.trim() || updating}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-lg"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </InstagramLayout>
  )
}
