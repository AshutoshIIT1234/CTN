'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, MessageSquare, ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

/* ── Types ───────────────────────────────────────────────────── */
interface SuggestedUser {
  id: string
  username: string
  displayName?: string
  profilePictureUrl?: string
  followerCount: number
  college?: { id: string; name: string }
}

interface TrendingTopic {
  id: string
  name: string
  postCount: number
}

interface NetworkStats {
  totalPosts: number
  totalToday: number
}

/* ── Small reusable skeleton ─────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={`block bg-slate-100 dark:bg-dark-800 animate-pulse rounded-lg ${className ?? ''}`}
    />
  )
}

/* ── Section wrapper ─────────────────────────────────────────── */
function Card({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  action,
  children,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-slate-100 dark:border-dark-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export function RightPanel() {

  /* Network stats */
  const { data: stats } = useQuery<NetworkStats>({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const res = await api.get('/posts/stats')
      return res.data
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  /* Suggested users — endpoint returns { users: [...] } */
  const { data: suggestedUsers, isLoading: usersLoading } = useQuery<SuggestedUser[]>({
    queryKey: ['suggested-users'],
    queryFn: async () => {
      const res = await api.get('/users/suggested')
      return res.data.users ?? []
    },
    staleTime: 5 * 60_000,
  })

  /* Trending topics */
  const { data: trendingTopics, isLoading: topicsLoading } = useQuery<TrendingTopic[]>({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const res = await api.get('/posts/trending/topics')
      return res.data
    },
    staleTime: 5 * 60_000,
  })

  return (
    <div className="py-6 space-y-4 sticky top-0 h-screen overflow-y-auto hide-scrollbar">

      {/* ── Network Stats ───────────────────────────────────────── */}
      <Card
        icon={MessageSquare}
        iconBg="bg-blue-50 dark:bg-blue-500/10"
        iconColor="text-blue-600 dark:text-blue-400"
        title="Network Activity"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-dark-800 rounded-xl px-3 py-3">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              Total Posts
            </p>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
              {stats
                ? stats.totalPosts >= 1000
                  ? `${(stats.totalPosts / 1000).toFixed(1)}k`
                  : stats.totalPosts
                : <Skeleton className="h-7 w-12" />}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-dark-800 rounded-xl px-3 py-3">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              Posted Today
            </p>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
              {stats != null
                ? stats.totalToday
                : <Skeleton className="h-7 w-10" />}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Suggested Users ─────────────────────────────────────── */}
      <Card
        icon={Users}
        iconBg="bg-amber-50 dark:bg-amber-500/10"
        iconColor="text-amber-600 dark:text-amber-400"
        title="People to Follow"
      >
        <div className="space-y-3">
          {usersLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))
            : (suggestedUsers ?? []).slice(0, 4).map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                    {u.profilePictureUrl ? (
                      <img
                        src={u.profilePictureUrl}
                        alt={u.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {u.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {u.displayName || u.username}
                    </p>
                    {u.college ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] text-slate-400 truncate">{u.college.name}</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">@{u.username}</p>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {u.followerCount > 0
                      ? u.followerCount >= 1000
                        ? `${(u.followerCount / 1000).toFixed(1)}k`
                        : u.followerCount
                      : null}
                  </span>
                </Link>
              ))}

          {!usersLoading && (!suggestedUsers || suggestedUsers.length === 0) && (
            <p className="text-xs text-slate-400 text-center py-2">No suggestions yet.</p>
          )}
        </div>
      </Card>

      {/* ── Trending Topics ─────────────────────────────────────── */}
      <Card
        icon={TrendingUp}
        iconBg="bg-orange-50 dark:bg-orange-500/10"
        iconColor="text-orange-600 dark:text-orange-400"
        title="Trending"
        action={
          <Link
            href="/trending"
            className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="space-y-1">
          {topicsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-2.5 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))
            : (trendingTopics ?? []).slice(0, 5).map((topic) => (
                <Link
                  key={topic.id}
                  href="/trending"
                  className="group block px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-1">
                    {topic.name}
                  </p>
                  {topic.postCount > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {topic.postCount} {topic.postCount === 1 ? 'interaction' : 'interactions'}
                    </p>
                  )}
                </Link>
              ))}

          {!topicsLoading && (!trendingTopics || trendingTopics.length === 0) && (
            <p className="text-xs text-slate-400 text-center py-3">
              Nothing trending right now — be the first to post!
            </p>
          )}
        </div>
      </Card>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="px-1 pt-2">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <Link href="/about"   className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">About</Link>
          <Link href="/terms"   className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</Link>
          <Link href="/help"    className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Help</Link>
        </div>
        <p className="text-[10px] text-slate-300 dark:text-slate-700 mt-2">© {new Date().getFullYear()} CTN</p>
      </div>

    </div>
  )
}
