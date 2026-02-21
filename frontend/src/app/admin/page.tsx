'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { Shield, Users, Building, Settings, CreditCard, AlertTriangle, FileText, TrendingUp } from 'lucide-react'
import api from '@/lib/api'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user?.role !== UserRole.ADMIN) {
      router.push('/')
      return
    }

    fetchStats()
  }, [isAuthenticated, user, router])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return null
  }

  const adminSections = [
    {
      title: 'Post Management',
      description: 'Create, view, and manage posts',
      icon: FileText,
      href: '/admin/posts',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'College Management',
      description: 'Manage colleges and domains',
      icon: Building,
      href: '/admin/colleges',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Moderators',
      description: 'Assign moderator permissions',
      icon: Shield,
      href: '/admin/moderators',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate content',
      icon: AlertTriangle,
      href: '/admin/moderation',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      title: 'Payment Records',
      description: 'View payment history',
      icon: CreditCard,
      href: '/admin/payments',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ]

  return (
    <InstagramLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage the Critical Thinking Network platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-dark-900 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '-' : stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '-' : stats?.totalColleges || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Colleges</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '-' : stats?.totalModerators || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Moderators</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '-' : stats?.pendingReports || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminSections.map((section) => (
            <div
              key={section.title}
              onClick={() => router.push(section.href)}
              className="bg-white dark:bg-dark-900 rounded-xl p-5 border border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${section.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5 truncate">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {section.description}
                  </p>
                </div>
                
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          
          <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-700 divide-y divide-gray-200 dark:divide-dark-700">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-royal-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading activity...</p>
              </div>
            ) : (
              <>
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        New user registered
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        New post created
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Post reported
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </InstagramLayout>
  )
}