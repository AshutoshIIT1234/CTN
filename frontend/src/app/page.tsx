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
import { Sparkles, MessageSquare, ArrowDown, LogIn } from 'lucide-react'

export default function Home() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>('latest')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)

  // Fetch national posts
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['national-feed', page, activeFilter],
    queryFn: async () => {
      const response = await api.get(`/posts/national?page=${page}&limit=10&filter=${activeFilter}`)
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
      <div className="px-6 py-8">
        {isLoading ? (
          <PostSkeleton count={3} />
        ) : (data?.posts && data.posts.length > 0) ? (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {data.posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id || post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
            {data.pagination && data.pagination.currentPage < data.pagination.totalPages && (
              <div className="text-center py-12">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="group relative px-8 py-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800/80 transition-all shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 active:translate-y-0"
                >
                  <span className="flex items-center gap-3">
                    Uncover More Intel
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 bg-amber-400 p-2 rounded-2xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>

            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Intellectual Silence
            </h3>
            <p className="text-slate-400 font-medium mb-10 max-w-sm leading-relaxed">
              The grid is currently quiet. Be the catalyst that starts a global discourse.
            </p>

            {user ? (
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4" />
                Initialize Thesis
              </button>
            ) : (
              <button
                onClick={handleLoginRequired}
                className="px-10 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 text-slate-900 dark:text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200/40 dark:shadow-none hover:bg-slate-50 dark:hover:bg-dark-800/80 transition-all flex items-center gap-3"
              >
                <LogIn className="w-4 h-4" />
                Access Network
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Authorize your profile to engage with the network's elite thinkers"
      />

      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onPostCreated={refetch}
      />
    </InstagramLayout>
  )
}

