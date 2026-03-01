'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Heart, MessageCircle, UserPlus, Award, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'

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

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login')
    return null
  }

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const response = await api.get(`/notifications?filter=${filter}`)
      return response.data
    },
  })

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      refetch()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      refetch()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />
      case 'COMMENT':
      case 'REPLY':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'FOLLOW':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'MENTION':
        return <Award className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <InstagramLayout>
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Intellectual Feed
              </h1>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                Network Status & Interactions
              </p>
            </div>
          </div>

          {data?.notifications && data.notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-6 py-3 text-xs font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 shadow-sm"
            >
              Clear Backlog
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
          >
            Universal
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === 'unread'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : data?.notifications && data.notifications.length > 0 ? (
          data.notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-5 rounded-3xl transition-all cursor-pointer relative group/item border border-transparent ${!notification.read
                  ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-dark-800'
                }`}
              onClick={() => {
                if (!notification.read) {
                  handleMarkAsRead(notification.id)
                }
                if (notification.postId) {
                  router.push(`/posts/${notification.postId}`)
                }
              }}
            >
              <div className="flex gap-3">
                {/* Actor Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-700 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-dark-900 shadow-sm overflow-hidden p-0.5">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-dark-900 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-sm">
                    {notification.actorUsername[0].toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-snug">
                        <span className="font-black text-slate-900 dark:text-white mr-1.5">{notification.actorUsername}</span>
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-3 shadow-lg shadow-blue-500/50" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 dark:bg-dark-800 rounded-[32px] flex items-center justify-center mx-auto relative overflow-hidden">
              <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Zero Interference
              </h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto">
                No new signals detected in your sector of the network.
              </p>
            </div>
          </div>
        )}
      </div>
    </InstagramLayout>
  )
}
