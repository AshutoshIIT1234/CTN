'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import api from '@/lib/api'
import {
  Search, Filter, Mail, Building, Clock,
  ChevronLeft, ChevronRight, ChevronDown, UsersRound, ShieldCheck,
  ShieldAlert, User as UserIcon, GraduationCap,
} from 'lucide-react'

/* ── Role helpers ─────────────────────────────────────────────────── */
const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]:        'Guest',
  [UserRole.GENERAL_USER]: 'General User',
  [UserRole.COLLEGE_USER]: 'College User',
  [UserRole.MODERATOR]:    'Moderator',
  [UserRole.ADMIN]:        'Admin',
}

const ROLE_BADGE: Record<UserRole, { bg: string; text: string; icon: React.ElementType }> = {
  [UserRole.GUEST]:        { bg: 'bg-slate-100   dark:bg-slate-800/60',          text: 'text-slate-500  dark:text-slate-400',  icon: UserIcon       },
  [UserRole.GENERAL_USER]: { bg: 'bg-gray-100    dark:bg-gray-800/60',           text: 'text-gray-600   dark:text-gray-300',   icon: UserIcon       },
  [UserRole.COLLEGE_USER]: { bg: 'bg-emerald-50  dark:bg-emerald-500/10',        text: 'text-emerald-700 dark:text-emerald-400', icon: GraduationCap },
  [UserRole.MODERATOR]:    { bg: 'bg-blue-50     dark:bg-blue-500/10',           text: 'text-blue-700   dark:text-blue-400',   icon: ShieldCheck    },
  [UserRole.ADMIN]:        { bg: 'bg-purple-50   dark:bg-purple-500/10',         text: 'text-purple-700 dark:text-purple-400', icon: ShieldAlert    },
}

function RoleBadge({ role }: { role: UserRole }) {
  const style = ROLE_BADGE[role] ?? ROLE_BADGE[UserRole.GENERAL_USER]
  const Icon  = style.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

/* ── Types ────────────────────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────────────── */
export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')

  // Pagination
  const [page,  setPage]  = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  /* Auth guard */
  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (user?.role !== UserRole.ADMIN) { router.push('/'); return }
  }, [isAuthenticated, user, router])

  /* Fetch */
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page',  page.toString())
      params.append('limit', limit.toString())
      if (search)     params.append('search', search)
      if (roleFilter) params.append('role',   roleFilter)

      const res = await api.get(`/admin/users?${params.toString()}`)
      setUsersList(res.data.users ?? [])
      setTotal(res.data.total ?? 0)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) fetchUsers()
  }, [fetchUsers, user])

  /* Role change */
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const label = ROLE_LABELS[newRole] ?? newRole
    if (!confirm(`Change this user's role to "${label}"?`)) return
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role.')
    }
  }

  if (!user || user.role !== UserRole.ADMIN) return null

  const totalPages  = Math.ceil(total / limit)
  const showingFrom = ((page - 1) * limit) + 1
  const showingTo   = Math.min(page * limit, total)

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                <UsersRound className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                Admin
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View accounts, change roles, and filter all platform users.
            </p>
          </div>

          {/* Total pill */}
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl px-4 py-2 self-start">
            <UsersRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {loading ? '—' : total.toLocaleString()} users
            </span>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or username…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Role filter */}
          <div className="md:w-56 relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-shadow"
            >
              <option value="">All Roles</option>
              {Object.values(UserRole).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    College
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Joined
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    Change Role
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {loading ? (
                  /* Loading skeleton rows */
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-dark-700 flex-shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-28 bg-gray-100 dark:bg-dark-700 rounded-md" />
                            <div className="h-2.5 w-36 bg-gray-100 dark:bg-dark-700 rounded-md" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="h-3 w-32 bg-gray-100 dark:bg-dark-700 rounded-md" />
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="h-3 w-20 bg-gray-100 dark:bg-dark-700 rounded-md" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-6 w-24 bg-gray-100 dark:bg-dark-700 rounded-full" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-8 w-36 bg-gray-100 dark:bg-dark-700 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : usersList.length > 0 ? (
                  usersList.map((usr) => (
                    <tr
                      key={usr.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-800/60 transition-colors"
                    >
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-sm font-bold">
                              {(usr.displayName || usr.username)?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate leading-tight">
                              {usr.displayName || usr.username}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{usr.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        {usr.college ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{usr.college.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No college</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          {new Date(usr.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-5 py-3.5">
                        <RoleBadge role={usr.role} />
                      </td>

                      {/* Role-change dropdown */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="relative inline-flex items-center justify-end">
                          <select
                            value={usr.role}
                            onChange={(e) => handleRoleChange(usr.id, e.target.value as UserRole)}
                            disabled={usr.id === user.id}
                            title={usr.id === user.id ? "You can't change your own role" : 'Change role'}
                            className="text-xs border border-gray-200 dark:border-dark-600 rounded-lg py-1.5 pl-3 pr-7 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-shadow appearance-none cursor-pointer"
                          >
                            {Object.values(UserRole).map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r] ?? r}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <UsersRound className="w-10 h-10 text-gray-300 dark:text-dark-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        No users found
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Try adjusting your search or role filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-dark-800 px-5 py-3.5 border-t border-gray-200 dark:border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{showingFrom}–{showingTo}</span> of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> users
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-dark-600 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page number pills */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show pages around current
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        pageNum === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-gray-200 dark:border-dark-600 text-gray-500 hover:bg-white dark:hover:bg-dark-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-dark-600 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
