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
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, ArrowDown, LogIn, PenSquare } from 'lucide-react'

export default function Home() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>('latest')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['national-feed', page, activeFilter],
    queryFn: async () => {
      const response = await api.get(`/posts/national?page=${page}&limit=10&filter=${activeFilter}`)
      return response.data
    },
  })

  const handleLoginRequired = () => setLoginModalOpen(true)

  return (
    <InstagramLayout>
      {/* Sticky filter pills */}
      <FilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Feed */}
      <div className="py-3 md:py-6 px-0">
        {isLoading ? (
          <div className="px-3 md:px-6">
            <PostSkeleton count={3} />
          </div>
        ) : data?.posts && data.posts.length > 0 ? (
          <div className="space-y-3 md:space-y-6">
            <AnimatePresence mode="popLayout">
              {data.posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id || post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <InstagramPostCard
                    post={post}
                    onUpdate={refetch}
                    onLoginRequired={handleLoginRequired}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More */}
            {data.pagination &&
              data.pagination.currentPage < data.pagination.totalPages && (
                <div className="flex justify-center py-6 px-4">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPage((p) => p + 1)}
                    className="group flex items-center gap-3 px-7 py-3.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800/80 transition-all shadow-sm"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Load More
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </motion.button>
                </div>
              )}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 md:py-32 text-center px-6"
          >
            <div className="relative mb-6 md:mb-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[28px] md:rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <MessageSquare className="w-9 h-9 md:w-10 md:h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-amber-400 p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Nothing here yet
            </h3>
            <p className="text-[14px] text-slate-400 font-medium mb-8 max-w-xs leading-relaxed">
              Be the first to start a discussion on the national panel.
            </p>

            {user ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setCreatePostModalOpen(true)}
                className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20"
                style={{ touchAction: 'manipulation' }}
              >
                <PenSquare className="w-4 h-4" />
                Create First Post
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLoginRequired}
                className="flex items-center gap-2.5 px-8 py-4 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all"
                style={{ touchAction: 'manipulation' }}
              >
                <LogIn className="w-4 h-4" />
                Join Network
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating create button — mobile only, shown when user is logged in and feed has content */}
      {user && data?.posts?.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCreatePostModalOpen(true)}
          className="md:hidden fixed right-4 z-30 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-xl shadow-blue-500/30"
          style={{
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
            background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
            touchAction: 'manipulation',
          }}
          aria-label="Create post"
        >
          <PenSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Sign in to engage with the network"
      />

      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onPostCreated={refetch}
      />
    </InstagramLayout>
  )
}
