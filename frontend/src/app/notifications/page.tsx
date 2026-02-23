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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-primary-500 rounded-lg flex items-center justify-center">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-600">
                Stay updated with your activity
              </p>
            </div>
          </div>

          {data?.notifications && data.notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-royal-600 hover:bg-royal-50 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : data?.notifications && data.notifications.length > 0 ? (
          data.notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-royal-50/30' : ''
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {notification.actorUsername[0].toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{notification.actorUsername}</span>{' '}
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
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
                  <div className="w-2 h-2 bg-royal-600 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600">
              When you get notifications, they'll show up here
            </p>
          </div>
        )}
      </div>
    </InstagramLayout>
  )
}
