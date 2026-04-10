'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Heart, MessageCircle, UserPlus, Award, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { motion, AnimatePresence } from 'framer-motion'

export const dynamic = 'force-dynamic'

interface Notification {
  id: string
  type: 'LIKE' | 'COMMENT' | 'REPLY' | 'FOLLOW' | 'MENTION'
  message: string
  read: boolean
  createdAt: string
  actorUsername: string
  postId?: string
}

const TYPE_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  LIKE: {
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    label: 'Liked',
  },
  COMMENT: {
    icon: MessageCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    label: 'Commented',
  },
  REPLY: {
    icon: MessageCircle,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    label: 'Replied',
  },
  FOLLOW: {
    icon: UserPlus,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    label: 'Followed',
  },
  MENTION: {
    icon: Award,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    label: 'Mentioned',
  },
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: Notification
  onRead: (id: string) => void
  onNavigate: (n: Notification) => void
}) {
  const meta = TYPE_META[notification.type] ?? {
    icon: Bell,
    color: 'text-slate-500',
    bg: 'bg-slate-50 dark:bg-dark-800',
    label: 'Alert',
  }
  const Icon = meta.icon

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onNavigate(notification)}
      className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors relative border-b border-slate-50 dark:border-dark-800 last:border-b-0 ${
        !notification.read
          ? 'bg-blue-50/40 dark:bg-blue-500/5 hover:bg-blue-50/70 dark:hover:bg-blue-500/10'
          : 'hover:bg-slate-50 dark:hover:bg-dark-800/50'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50 flex-shrink-0" />
      )}

      {/* Type icon */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}
      >
        <Icon className={`w-4.5 h-4.5 ${meta.color}`} style={{ width: 18, height: 18 }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] md:text-[14px] text-slate-700 dark:text-slate-300 leading-snug">
          <span className="font-black text-slate-900 dark:text-white mr-1">
            {notification.actorUsername}
          </span>
          {notification.message}
        </p>
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Mark as read button */}
      {!notification.read && (
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation()
            onRead(notification.id)
          }}
          className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
          style={{ touchAction: 'manipulation' }}
          aria-label="Mark as read"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </motion.button>
      )}
    </motion.button>
  )
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login')
    }
  }, [user, router])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const response = await api.get(`/notifications?filter=${filter}`)
      return response.data
    },
    enabled: !!user,
  })

  if (!user) {
    return null
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      refetch()
    } catch {
      /* noop */
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      refetch()
    } catch {
      /* noop */
    }
  }

  const handleNavigate = (notification: Notification) => {
    if (!notification.read) handleMarkAsRead(notification.id)
    if (notification.postId) router.push(`/posts/${notification.postId}`)
  }

  const notifications: Notification[] = data?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <InstagramLayout showMobileHeader={false}>
      {/* ── Sticky Header ──────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 border-b border-slate-100 dark:border-dark-800 bg-white/90 dark:bg-dark-950/90"
        style={{
          height: 56,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
          >
            <Bell className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h1 className="text-[16px] font-black text-black dark:text-white leading-none tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-[11px] font-bold text-blue-500 mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest"
            style={{ touchAction: 'manipulation' }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Clear</span>
          </motion.button>
        )}
      </div>

      {/* ── Filter Pills ─────────────────────────────────────── */}
      <div className="flex gap-2 px-4 md:px-6 py-3 border-b border-slate-50 dark:border-dark-800 overflow-x-auto hide-scrollbar">
        {(['all', 'unread'] as const).map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className="relative flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all overflow-hidden bg-slate-50/80 dark:bg-dark-900/70 border border-slate-200/70 dark:border-dark-800/80"
            style={{ touchAction: 'manipulation' }}
          >
            {filter === f && (
              <motion.span
                layoutId="notifFilterBg"
                className="absolute inset-0 rounded-xl bg-slate-900 dark:bg-white"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                filter === f
                  ? 'text-white dark:text-slate-900'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Notification List ────────────────────────────────── */}
      <div className="pb-nav md:pb-8">
        {isLoading ? (
          /* Skeleton */
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-4 border-b border-slate-50 dark:border-dark-800">
                <div className="w-10 h-10 rounded-2xl skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-3/4 rounded-lg skeleton" />
                  <div className="h-3 w-1/3 rounded-lg skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="bg-white dark:bg-dark-900 md:mx-0">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-slate-50 dark:bg-dark-800 rounded-[28px] flex items-center justify-center">
                <Bell className="w-9 h-9 text-slate-200 dark:text-slate-700" />
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            </div>

            <h3 className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight mb-2">
              All caught up!
            </h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium max-w-[220px] leading-relaxed">
              {filter === 'unread'
                ? 'No unread notifications right now.'
                : "You don't have any notifications yet."}
            </p>

            {filter === 'unread' && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter('all')}
                className="mt-6 px-6 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 text-slate-600 dark:text-slate-300 font-black text-[12px] uppercase tracking-widest"
                style={{ touchAction: 'manipulation' }}
              >
                View All
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </InstagramLayout>
  )
}
