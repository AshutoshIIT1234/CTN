'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { MainLayout } from '@/components/layout/MainLayout'
import { PostCard } from '@/components/post/PostCard'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { PostSkeleton } from '@/components/post/PostSkeleton'

export default function FeedPage() {
  const { user } = useAuthStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('for-you')

  // Fetch all posts (both national and college) for unified feed
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unified-feed', page, activeTab],
    queryFn: async () => {
      // Fetch both national and college posts for a unified experience
      const [nationalResponse, collegeResponse] = await Promise.all([
        api.get(`/posts/national?page=${page}&limit=10`).catch(() => ({ data: { posts: [] } })),
        user ? api.get(`/posts/college?page=${page}&limit=10`).catch(() => ({ data: { posts: [] } })) : Promise.resolve({ data: { posts: [] } })
      ])
      
      // Combine and sort posts by creation date
      const allPosts = [
        ...(nationalResponse.data.posts || []),
        ...(collegeResponse.data.posts || [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return {
        posts: allPosts,
        pagination: nationalResponse.data.pagination || { totalPages: 1, currentPage: 1 }
      }
    },
  })

  const handlePostCreated = () => {
    setIsCreateModalOpen(false)
    refetch()
  }

  return (
    <MainLayout>
      {/* Header - Critical Thinking Panel */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-0">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold">Critical Thinking</h1>
            <button className="p-2 rounded-full hover:bg-gray-900 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'for-you' 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              National Discourse
              {activeTab === 'for-you' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-4 text-center font-medium transition-colors relative ${
                activeTab === 'following' 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Trending Topics
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Compose Tweet Area */}
      {user && (
        <div className="border-b border-gray-800 p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-semibold">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full text-left text-xl text-gray-500 py-3 hover:text-gray-300 transition-colors"
              >
                Share your thoughts on current affairs...
              </button>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-4">
                  {/* Tweet options would go here */}
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest User Banner */}
      {!user && (
        <div className="border-b border-gray-800 bg-gradient-to-r from-primary-900/20 to-purple-900/20 p-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Join the Intellectual Discourse
            </h2>
            <p className="text-gray-300 mb-4">
              Sign in to participate in discussions, share your perspectives, and engage with the community
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/auth/login"
                className="bg-transparent border-2 border-primary-500 hover:bg-primary-900/30 text-primary-400 font-bold py-2 px-6 rounded-full transition-colors"
              >
                Sign in
              </a>
              <a
                href="/auth/register"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Unified Feed - All Posts */}
      <div>
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (data?.posts && data.posts.length > 0) ? (
          data.posts.map((post: any, index: number) => (
            <motion.div
              key={post.id || post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PostCard post={post} onUpdate={refetch} />
            </motion.div>
          ))
        ) : (
          <div className="py-16 text-center px-8">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Welcome to Critical Thinking
            </h3>
            <p className="text-gray-500 mb-6 text-lg">
              Engage in national-level intellectual discourse. Share your perspectives on current affairs, politics, and societal issues.
            </p>
            {user ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
              >
                Start a discussion
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">Join the conversation</p>
                <div className="flex gap-4 justify-center">
                  <a
                    href="/auth/login"
                    className="bg-transparent border border-gray-600 hover:bg-gray-900 text-primary-400 font-bold py-3 px-6 rounded-full transition-colors"
                  >
                    Sign in
                  </a>
                  <a
                    href="/auth/register"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      {(data?.posts && data.posts.length > 0) && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full py-3 text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Show more posts
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </MainLayout>
  )
}
