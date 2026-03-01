'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import api from '@/lib/api'
import { Search, Filter, Shield, AlertTriangle, Check, User, Mail, Building, Clock } from 'lucide-react'

interface AdminUser {
    id: string
    email: string
    username: string
    displayName: string
    role: UserRole
    collegeId: string | null
    createdAt: string
    college?: {
        id: string
        name: string
        emailDomain: string
    }
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [usersList, setUsersList] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('')

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
        fetchUsers()
    }, [isAuthenticated, user, router, page, search, roleFilter])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('limit', limit.toString())
            if (search) params.append('search', search)
            if (roleFilter) params.append('role', roleFilter)

            const response = await api.get(`/admin/users?${params.toString()}`)
            setUsersList(response.data.users)
            setTotal(response.data.total || 0)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole })
            // Update local state
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update role')
        }
    }

    if (!user || user.role !== UserRole.ADMIN) return null

    const totalPages = Math.ceil(total / limit)

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage roles, view accounts, and apply filters for all platform users.
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                        >
                            <option value="">All Roles</option>
                            {Object.values(UserRole).map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-luxury border border-gray-200 dark:border-dark-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
                                <tr>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        College
                                    </th>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Member Since
                                    </th>
                                    <th className="px-4 text-left sm:px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
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
                                ) : usersList.length > 0 ? (
                                    usersList.map((usr) => (
                                        <tr key={usr.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 shrink-0">
                                                        <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                                            {usr.username?.[0]?.toUpperCase() || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 dark:text-white truncate">
                                                            {usr.displayName || usr.username}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                                            <Mail className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{usr.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                                    {usr.college ? (
                                                        <>
                                                            <Building className="w-4 h-4 text-gray-400 shrink-0" />
                                                            <span className="truncate max-w-[150px]">{usr.college.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No College</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="w-4 h-4 shrink-0" />
                                                    {new Date(usr.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${usr.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        usr.role === UserRole.MODERATOR ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                    }
                        `}>
                                                    {usr.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                                <select
                                                    value={usr.role}
                                                    onChange={(e) => handleRoleChange(usr.id, e.target.value as UserRole)}
                                                    className="bg-transparent border border-gray-300 dark:border-dark-600 rounded-md py-1 px-2 text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                                                    disabled={usr.id === user.id} // Cannot change own role
                                                >
                                                    {Object.values(UserRole).map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No users found.
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
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-md text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-gray-300 dark:border-dark-600 rounded-md text-sm disabled:opacity-50"
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
