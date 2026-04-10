'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Flame } from 'lucide-react'
import api from '@/lib/api'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { InstagramPostCard } from '@/components/post/InstagramPostCard'
import { PostSkeleton } from '@/components/post/PostSkeleton'
import { LoginModal } from '@/components/premium/LoginModal'

type TimeRange = 'today' | 'week' | 'month'

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

export default function TrendingPage() {
  const [page, setPage]             = useState(1)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [timeRange, setTimeRange]   = useState<TimeRange>('today')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trending-posts', page, timeRange],
    queryFn: async () => {
      const res = await api.get(
        `/posts/national?page=${page}&limit=10&sort=trending&timeRange=${timeRange}`,
      )
      return res.data
    },
  })

  return (
    <InstagramLayout>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-slate-100 dark:border-dark-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Trending
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Most engaged posts right now
            </p>
          </div>
        </div>

        {/* ── Time-range filter ───────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTimeRange(opt.value); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                timeRange === opt.value
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ───────────────────────────────────────────────── */}
      <div>
        {isLoading ? (
          <div className="px-4 sm:px-6 py-4 space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : data?.posts && data.posts.length > 0 ? (
          <>
            {data.posts.map((post: any) => (
              <InstagramPostCard
                key={post.id || post._id}
                post={post}
                onUpdate={refetch}
                onLoginRequired={() => setLoginModalOpen(true)}
              />
            ))}

            {/* Load more */}
            {data.pagination &&
              data.pagination.currentPage < data.pagination.totalPages && (
                <div className="flex justify-center py-8">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2.5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all shadow-sm"
                  >
                    Load more
                  </button>
                </div>
              )}
          </>
        ) : (
          /* ── Empty state ─────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-14 h-14 bg-slate-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              No trending posts yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              No posts have gained significant traction{' '}
              {timeRange === 'today'
                ? 'today'
                : timeRange === 'week'
                ? 'this week'
                : 'this month'}
              . Try a different time range.
            </p>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Sign in to join trending discussions"
      />
    </InstagramLayout>
  )
}
