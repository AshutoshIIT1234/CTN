'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { LoginModal } from '@/components/premium/LoginModal'
import { PostSkeleton } from '@/components/post/PostSkeleton'
import { CreatePostModal } from '@/components/post/CreatePostModal'

export default function Home() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState('latest')
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
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveFilter('latest')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeFilter === 'latest'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔥 Latest
          </button>
          <button
            onClick={() => setActiveFilter('trending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeFilter === 'trending'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            📈 Trending
          </button>
          <button
            onClick={() => setActiveFilter('debate')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeFilter === 'debate'
                ? 'bg-royal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            🧠 Debate
          </button>
        </div>
      </div>

      {/* Create Post Card (for logged-in users) */}
      {user && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <button
              className="flex-1 text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-500 transition-colors"
              onClick={() => setCreatePostModalOpen(true)}
            >
              Start a discussion, {user.username}...
            </button>
          </div>
        </div>
      )}

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
                onLoginRequired={handleLoginRequired}
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
            <div className="w-16 h-16 bg-gradient-to-br from-royal-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to start a discussion
            </p>
            {user ? (
              <button className="px-6 py-2 bg-royal-600 text-white rounded-lg font-semibold hover:bg-royal-700 transition-colors">
                Create First Post
              </button>
            ) : (
              <button
                onClick={handleLoginRequired}
                className="px-6 py-2 bg-royal-600 text-white rounded-lg font-semibold hover:bg-royal-700 transition-colors"
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
