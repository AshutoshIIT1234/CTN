'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import api from '@/lib/api'
import { Search, Filter, Shield, AlertTriangle, Check, BookOpen, Trash2, Eye, EyeOff, Flag } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminModerationPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [activeTab, setActiveTab] = useState<'posts' | 'resources'>('posts')
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 20

    useEffect(() => {
        if (!isAuthenticated) return router.push('/auth/login')
        if (user?.role !== UserRole.ADMIN) return router.push('/')
        fetchItems()
    }, [activeTab, page])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const endpoint = activeTab === 'posts' ? '/admin/moderation/posts' : '/admin/moderation/resources'
            const response = await api.get(`${endpoint}?page=${page}&limit=${limit}&includeDeleted=true&includeHidden=true`)
            setItems(response.data.posts || response.data.resources || response.data)
            // Usually would set total here if API returns it, simplified for now
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this item?')) return
        try {
            const endpoint = activeTab === 'posts' ? `/admin/moderation/posts/${id}` : `/admin/moderation/resources/${id}`
            await api.delete(endpoint)
            fetchItems()
        } catch (error) {
            alert('Failed to delete item')
        }
    }

    const handleToggleHide = async (id: string, isHidden: boolean) => {
        try {
            await api.put(`/admin/moderation/posts/${id}/${isHidden ? 'unhide' : 'hide'}`)
            fetchItems()
        } catch (error) {
            alert('Failed to update visibility')
        }
    }

    if (!user || user.role !== UserRole.ADMIN) return null

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Content Moderation
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Platform-wide moderation of user posts and resources.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-8 bg-gray-100 dark:bg-dark-800 p-1 rounded-xl w-full sm:w-fit whitespace-nowrap">
                    <button
                        onClick={() => { setActiveTab('posts'); setPage(1); }}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'posts'
                            ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => { setActiveTab('resources'); setPage(1); }}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'resources'
                            ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Resources
                    </button>
                </div>

                {/* Content Table/List */}
                <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-luxury border border-gray-200 dark:border-dark-800 overflow-hidden p-4 sm:p-6">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className={`p-4 rounded-xl border ${item.isFlagged ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-900/20' : 'border-gray-200 dark:border-dark-700'}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="w-full min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {item.title || item.fileName || 'Untitled'}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {item.content || item.description || 'No description provided.'}
                                            </p>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span>By: {item.author?.username || item.uploader?.username || 'Unknown'}</span>
                                                {item.isFlagged && <span className="text-red-500 flex items-center"><Flag className="w-3 h-3 mr-1" /> Flagged</span>}
                                                {item.isHidden && <span className="text-yellow-500 flex items-center"><EyeOff className="w-3 h-3 mr-1" /> Hidden</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                            {activeTab === 'posts' && (
                                                <button
                                                    onClick={() => handleToggleHide(item.id, item.isHidden)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-dark-800 rounded-lg"
                                                    title={item.isHidden ? "Unhide Post" : "Hide Post"}
                                                >
                                                    {item.isHidden ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-yellow-500" />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                                title="Delete Permanently"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">No content found.</div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}
