'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { PostSkeleton } from '@/components/post/PostSkeleton'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['national-feed'],
    queryFn: async () => {
      const res = await api.get('/posts/national', {
        params: { page: 1, limit: 20, filter: 'latest' },
      })
      return res.data
    },
    staleTime: 60_000,
  })

  return (
    <InstagramLayout>
      {/* Error State */}
      {error && (
        <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Feed */}
      <div>
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : data?.posts && data.posts.length > 0 ? (
          data.posts.map((post: any) => (
            <InstagramPostCard
              key={post.id}
              post={post}
              onUpdate={refetch}
              onLoginRequired={() => {}}
            />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600">
              Be the first to share a thought.
            </p>
          </div>
        )}
      </div>
    </InstagramLayout>
  )
}
