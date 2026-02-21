'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { FilterPills, FilterType } from '@/components/feed/FilterPills'
import { LoginModal } from '@/components/auth/LoginModal'
import { PostSkeleton } from '@/components/post/PostSkeleton'
import { CreatePostModal } from '@/components/post/CreatePostModal'

export default function Home() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>('latest')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)

  // Fetch national posts
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['national-feed', page],
    queryFn: async () => {
      const response = await api.get(`/posts/national?page=${page}&limit=10`)
      return response.data
    },
  })

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  return (
    <InstagramLayout>
      {/* Filter Pills */}
      <FilterPills 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Posts Feed */}
      <div className="px-4 py-4">
        {isLoading ? (
          <PostSkeleton count={3} />
        ) : (data?.posts && data.posts.length > 0) ? (
          <>
            {data.posts.map((post: any) => (
              <InstagramPostCard
                key={post.id || post._id}
                post={post}
                onUpdate={refetch}
                onLoginRequired={handleLoginRequired}
              />
            ))}

            {/* Load More */}
            {data.pagination && data.pagination.currentPage < data.pagination.totalPages && (
              <div className="text-center py-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2 text-sm font-semibold text-[#0095F6] hover:text-[#1877F2] transition-colors"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-royal-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No discussions yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Be the first to start a meaningful conversation
            </p>
            {user ? (
              <button 
                onClick={() => setCreatePostModalOpen(true)}
                className="px-8 py-3 bg-[#0095F6] hover:bg-[#1877F2] text-white rounded-lg font-semibold transition-colors"
              >
                Create First Post
              </button>
            ) : (
              <button
                onClick={handleLoginRequired}
                className="px-8 py-3 bg-[#0095F6] hover:bg-[#1877F2] text-white rounded-lg font-semibold transition-colors"
              >
                Login to Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Join CTN to participate in discussions and connect with brilliant minds"
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onPostCreated={refetch}
      />
    </InstagramLayout>
  )
}
