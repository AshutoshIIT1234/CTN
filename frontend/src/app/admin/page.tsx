'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import {
  Shield,
  Users,
  Building,
  Settings,
  CreditCard,
  AlertTriangle,
  FileText,
  TrendingUp,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Activity,
  Bell,
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/api'

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) return null

  /* ── Stat cards ───────────────────────────────────────────── */
  const statCards = [
    {
      label: 'Users',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-200 dark:shadow-blue-900/30',
    },
    {
      label: 'Colleges',
      value: stats?.totalColleges ?? '—',
      icon: Building,
      gradient: 'from-emerald-500 to-green-400',
      shadow: 'shadow-emerald-200 dark:shadow-emerald-900/30',
    },
    {
      label: 'Moderators',
      value: stats?.totalModerators ?? '—',
      icon: Shield,
      gradient: 'from-violet-500 to-purple-400',
      shadow: 'shadow-violet-200 dark:shadow-violet-900/30',
    },
    {
      label: 'Reports',
      value: stats?.pendingReports ?? '—',
      icon: AlertTriangle,
      gradient: 'from-orange-500 to-amber-400',
      shadow: 'shadow-orange-200 dark:shadow-orange-900/30',
    },
  ]

  /* ── Section cards ────────────────────────────────────────── */
  const adminSections = [
    {
      title: 'Post Management',
      description: 'Create, view and manage posts',
      icon: FileText,
      href: '/admin/posts',
      gradient: 'from-pink-500 to-rose-400',
      badge: null,
    },
    {
      title: 'College Management',
      description: 'Manage colleges and domains',
      icon: Building,
      href: '/admin/colleges',
      gradient: 'from-blue-500 to-cyan-400',
      badge: null,
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-emerald-500 to-green-400',
      badge: null,
    },
    {
      title: 'Moderators',
      description: 'Assign moderator permissions',
      icon: Shield,
      href: '/admin/moderators',
      gradient: 'from-violet-500 to-purple-400',
      badge: null,
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate content',
      icon: AlertTriangle,
      href: '/admin/moderation',
      gradient: 'from-orange-500 to-amber-400',
      badge: stats?.pendingReports > 0 ? stats.pendingReports : null,
    },
    {
      title: 'Payment Records',
      description: 'View payment history',
      icon: CreditCard,
      href: '/admin/payments',
      gradient: 'from-indigo-500 to-blue-400',
      badge: null,
    },
    {
      title: 'Resource Management',
      description: 'Manage study materials & assets',
      icon: BookOpen,
      href: '/admin/resources',
      gradient: 'from-teal-500 to-cyan-400',
      badge: null,
    },
  ]

  /* ── Recent activity (mock) ──────────────────────────────── */
  const recentActivity = [
    {
      icon: Users,
      gradient: 'from-emerald-500 to-green-400',
      title: 'New user registered',
      time: '2 min ago',
    },
    {
      icon: FileText,
      gradient: 'from-pink-500 to-rose-400',
      title: 'New post created',
      time: '15 min ago',
    },
    {
      icon: AlertTriangle,
      gradient: 'from-orange-500 to-amber-400',
      title: 'Post reported',
      time: '1 hr ago',
    },
  ]

  return (
    <InstagramLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950">

        {/* ── Mobile sticky header ──────────────────────────── */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-4 md:hidden"
          style={{
            height: 52,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(226,232,240,0.5)',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)' }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">
              Admin Hub
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
            style={{ touchAction: 'manipulation' }}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </motion.button>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">

          {/* ── Desktop Header ─────────────────────────────── */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage the Critical Thinking Network platform
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-300 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-dark-800 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>

          {/* ── Stat Cards Grid (2×2 on mobile, 4-col on md+) ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 md:mb-6">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white dark:bg-dark-900 rounded-2xl p-4 border border-slate-100 dark:border-dark-800 shadow-sm"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-md ${card.shadow}`}
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>

                  {/* Value */}
                  {loading ? (
                    <div className="h-7 w-12 rounded-lg skeleton mb-1" />
                  ) : (
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                      {typeof card.value === 'number'
                        ? card.value.toLocaleString()
                        : card.value}
                    </p>
                  )}

                  {/* Label */}
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {card.label}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* ── Quick-action banner (mobile) ──────────────── */}
          {stats?.pendingReports > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/moderation')}
              className="md:hidden w-full flex items-center gap-3 mb-4 px-4 py-3.5 rounded-2xl text-left"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
                touchAction: 'manipulation',
              }}
            >
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-white leading-none">
                  {stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''}
                </p>
                <p className="text-[10px] font-bold text-white/70 mt-0.5 uppercase tracking-wider">
                  Tap to review
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
            </motion.button>
          )}

          {/* ── Section cards ─────────────────────────────── */}
          <div className="mb-6">
            <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 px-1">
              Management
            </h2>
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800 shadow-sm overflow-hidden">
              {adminSections.map((section, i) => {
                const Icon = section.icon
                return (
                  <motion.button
                    key={section.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                    whileTap={{ backgroundColor: 'rgba(241,245,249,0.8)' }}
                    onClick={() => router.push(section.href)}
                    className="w-full flex items-center gap-4 px-4 py-4 border-b border-slate-50 dark:border-dark-800 last:border-b-0 text-left transition-colors hover:bg-slate-50 dark:hover:bg-dark-800/60 active:bg-slate-100 dark:active:bg-dark-800"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {/* Icon */}
                    <div
                      className={`w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br ${section.gradient} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={2} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] md:text-[15px] font-black text-slate-900 dark:text-white truncate">
                          {section.title}
                        </p>
                        {section.badge && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                            {section.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                        {section.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ── Recent Activity ────────────────────────────── */}
          <div>
            <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 px-1">
              Recent Activity
            </h2>

            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                    Loading…
                  </p>
                </div>
              ) : (
                recentActivity.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.07 + 0.4 }}
                      className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 dark:border-dark-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          {item.time}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 shadow-sm" />
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          {/* Bottom spacer for mobile nav */}
          <div className="h-6 md:hidden" />
        </div>
      </div>
    </InstagramLayout>
  )
}
