'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import api from '@/lib/api'
import { Search, BookOpen, Trash2, Building, Clock, Filter } from 'lucide-react'

interface Resource {
    id: string;
    collegeId: string;
    resourceType: string;
    department: string;
    batch: string;
    fileName: string;
    fileUrl: string;
    uploadedBy: string;
    description: string;
    uploadDate: string;
    college?: {
        id: string;
        name: string;
    };
    uploader?: {
        id: string;
        username: string;
        displayName: string;
    };
}

export default function AdminResourcesPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [resourcesList, setResourcesList] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [resourceTypeFilter, setResourceTypeFilter] = useState('')

    // Pagination State
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 20

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login')
            return
        }
        if (user?.role !== UserRole.ADMIN) {
            router.push('/')
            return
        }
        fetchResources()
    }, [isAuthenticated, user, router, page, search, resourceTypeFilter])

    const fetchResources = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('limit', limit.toString())
            if (search) params.append('search', search)
            if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter)

            const response = await api.get(`/resources/admin/all?${params.toString()}`)
            // Assuming response looks like { data: ..., count: ... } or { resources: ..., total: ... }
            if (response.data && Array.isArray(response.data)) {
                setResourcesList(response.data);
                setTotal(response.data.length); // If it doesn't return total
            } else if (response.data.resources) {
                setResourcesList(response.data.resources);
                setTotal(response.data.total || response.data.resources.length);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return

        try {
            await api.delete(`/resources/admin/${resourceId}`)
            setResourcesList(prev => prev.filter(r => r.id !== resourceId))
            setTotal(t => Math.max(0, t - 1))
        } catch (error: any) {
            console.error('Failed to delete resource:', error)
            alert(error.response?.data?.message || 'Failed to delete resource')
        }
    }

    if (!user || user.role !== UserRole.ADMIN) return null

    const totalPages = Math.ceil(total / limit) || 1

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                        Resource Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        View, search, and manage all academic resources across colleges.
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search resources by name, description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={resourceTypeFilter}
                            onChange={(e) => setResourceTypeFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="">All Types</option>
                            <option value="TOPPER_NOTES">Topper Notes</option>
                            <option value="PYQS">PYQs</option>
                            <option value="CASE_DECKS">Case Decks</option>
                            <option value="PRESENTATIONS">Presentations</option>
                            <option value="STRATEGIES">Strategies</option>
                        </select>
                    </div>
                </div>

                {/* Resources Table */}
                <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-luxury border border-gray-200 dark:border-dark-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
                                <tr>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Resource
                                    </th>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        College
                                    </th>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type & Dept
                                    </th>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-4 text-right sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : resourcesList.length > 0 ? (
                                    resourcesList.map((resource) => (
                                        <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 shrink-0 border border-blue-200 dark:border-blue-800/50">
                                                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                                            {resource.fileName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                            {resource.description || 'No description'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                                    {resource.college ? (
                                                        <>
                                                            <Building className="w-4 h-4 text-gray-400 shrink-0" />
                                                            <span className="truncate max-w-[150px]">{resource.college.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No College Info</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {resource.resourceType}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                                    <span>{resource.department}</span>
                                                    {(resource.batch && resource.batch !== 'General') && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{resource.batch}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col justify-center whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 shrink-0" />
                                                        {new Date(resource.uploadDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs">
                                                        by {resource.uploader?.displayName || resource.uploader?.username || 'Unknown'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => window.open(resource.fileUrl, '_blank')}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        View
                                                    </button>
                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                    <button
                                                        onClick={() => handleDeleteResource(resource.id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex flex-row items-center gap-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No resources found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 dark:bg-dark-800 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} resources
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    )
}
