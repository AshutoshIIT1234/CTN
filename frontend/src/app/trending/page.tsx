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
      <div className="px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              High-Velocity Intel
            </h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
              Analyzing Network Saturation & Engagement
            </p>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${timeRange === 'today'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
          >
            Temporal: 24h
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${timeRange === 'week'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
          >
            Temporal: 7d
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${timeRange === 'month'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
          >
            Temporal: 30d
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
              <div className="text-center py-12">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800/80 transition-all shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 active:translate-y-0"
                >
                  Deeper Extraction
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 dark:bg-dark-800 rounded-[32px] flex items-center justify-center mx-auto relative overflow-hidden">
              <TrendingUp className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Stagnation Detected
              </h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto">
                No discussions have reached critical velocity for the selected temporal window.
              </p>
            </div>
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
