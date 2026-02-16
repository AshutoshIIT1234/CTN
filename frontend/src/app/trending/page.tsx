'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Flame, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { PostSkeleton } from '@/components/post/PostSkeleton'
import { LoginModal } from '@/components/premium/LoginModal'

export default function TrendingPage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')

  // Fetch trending posts
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trending-posts', page, timeRange],
    queryFn: async () => {
      const response = await api.get(`/posts/national?page=${page}&limit=10&sort=trending&timeRange=${timeRange}`)
      return response.data
    },
  })

  return (
    <InstagramLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Trending Discussions
            </h1>
            <p className="text-sm text-gray-600">
              Most popular discussions right now
            </p>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              timeRange === 'today'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              timeRange === 'week'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              timeRange === 'month'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div>
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (data?.posts && data.posts.length > 0) ? (
          <>
            {data.posts.map((post: any) => (
              <InstagramPostCard
                key={post.id || post._id}
                post={post}
                onUpdate={refetch}
                onLoginRequired={() => setLoginModalOpen(true)}
              />
            ))}

            {/* Load More */}
            {data.pagination && data.pagination.currentPage < data.pagination.totalPages && (
              <div className="text-center py-6">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No trending posts yet
            </h3>
            <p className="text-gray-600">
              Check back later for trending discussions
            </p>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Join CTN to participate in trending discussions"
      />
    </InstagramLayout>
  )
}
