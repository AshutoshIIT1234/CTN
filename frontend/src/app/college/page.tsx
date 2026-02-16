'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { GraduationCap, Plus, Shield, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { PostSkeleton } from '@/components/post/PostSkeleton'
import { LoginModal } from '@/components/premium/LoginModal'

interface CollegeFeedData {
  college: {
    id: string
    name: string
    logoUrl?: string
  }
  posts: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function CollegePage() {
  const { user } = useAuthStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Check if user has college access
  const hasCollegeAccess = user && (
    user.role === 'COLLEGE_USER' || 
    user.role === 'MODERATOR' || 
    user.role === 'ADMIN'
  )

  const { data, isLoading, refetch, error } = useQuery<CollegeFeedData>({
    queryKey: ['college-feed', user?.collegeId, page],
    queryFn: async () => {
      if (!user?.collegeId) {
        throw new Error('No college ID available')
      }
      const response = await api.get(`/posts/college/${user.collegeId}?page=${page}&limit=20`)
      return response.data
    },
    enabled: Boolean(hasCollegeAccess && user?.collegeId),
  })

  const handlePostCreated = () => {
    setIsCreateModalOpen(false)
    refetch()
  }

  // Access denied for non-college users
  if (!hasCollegeAccess) {
    return (
      <InstagramLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 p-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              College Panel Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              This section is only available to college users, moderators, and administrators.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Register with a college email address to access your college's discussion panel.
            </p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-6 py-2 bg-royal-600 text-white rounded-lg font-semibold hover:bg-royal-700 transition-colors"
            >
              Login with College Email
            </button>
          </div>
        </div>
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          message="Login with your college email to access your college's private discussion panel"
        />
      </InstagramLayout>
    )
  }

  // No college ID available
  if (!user?.collegeId) {
    return (
      <InstagramLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 p-12">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              College Information Missing
            </h2>
            <p className="text-gray-600">
              Your account doesn't have college information associated with it.
            </p>
          </div>
        </div>
      </InstagramLayout>
    )
  }

  return (
    <InstagramLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data?.college?.logoUrl ? (
              <img
                src={data.college.logoUrl}
                alt={`${data.college.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-primary-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                College Discussion
              </h1>
              <p className="text-sm text-gray-600">
                {data?.college?.name || 'Private college community'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Card */}
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
              onClick={() => setIsCreateModalOpen(true)}
            >
              Share with your college community...
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">
              Failed to load college feed. Please try again.
            </p>
          </div>
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
              onLoginRequired={() => setLoginModalOpen(true)}
            />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to start a discussion in your college!
            </p>
            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2 bg-royal-600 text-white rounded-lg font-semibold hover:bg-royal-700 transition-colors"
              >
                Create Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Login with your college email to access your college's private discussion panel"
      />
    </InstagramLayout>
  )
}