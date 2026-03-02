'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, User, MapPin, ArrowLeft, Hash, TrendingUp } from 'lucide-react'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const dynamic = 'force-dynamic'

interface UserSearchResult {
  id: string
  username: string
  displayName?: string
  profilePictureUrl?: string
  role: UserRole
  college?: {
    id: string
    name: string
  }
}

interface TrendingTopic {
  id: string
  name: string
  postCount: number
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:      return 'Admin'
    case UserRole.MODERATOR:  return 'Moderator'
    case UserRole.COLLEGE_USER: return 'College'
    case UserRole.GENERAL_USER: return 'Member'
    default:                  return role
  }
}

function getRoleColor(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:       return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
    case UserRole.MODERATOR:   return 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
    case UserRole.COLLEGE_USER: return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    default:                   return 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400'
  }
}

const TABS = [
  { id: 'users',  label: 'People' },
  { id: 'topics', label: 'Topics' },
]

function SearchContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched]   = useState(false)
  const [activeTab, setActiveTab]       = useState('users')

  const debouncedQuery = useDebounce(searchQuery, 300)

  // Fetch trending topics from backend (real data)
  const { data: trendingTopics, isLoading: topicsLoading } = useQuery<TrendingTopic[]>({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const res = await api.get('/posts/trending/topics')
      return res.data
    },
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery)
    } else {
      setSearchResults([])
      setHasSearched(false)
    }
  }, [debouncedQuery])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    setHasSearched(true)
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      setSearchResults(res.data.users || [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <InstagramLayout>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-dark-800">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-white" />
          </button>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Search</h1>
        </div>
      </div>

      {/* ── Search input ──────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-dark-800">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-800 border border-transparent focus:border-blue-500/40 focus:bg-white dark:focus:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-100 dark:border-dark-800 bg-white dark:bg-dark-900">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 relative"
          >
            <span
              className={`text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="searchTabBar"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="min-h-[60vh]">

        {/* Loading spinner (user search) */}
        {isSearching && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ─── People tab ──────────────────────────────────────────── */}
        {activeTab === 'users' && !isSearching && (
          <>
            {/* Results list */}
            {searchResults.length > 0 && (
              <ul>
                {searchResults.map((result, index) => (
                  <motion.li
                    key={result.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <button
                      onClick={() => router.push(`/profile/${result.id}`)}
                      className="w-full flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-50 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      {result.profilePictureUrl ? (
                        <img
                          src={result.profilePictureUrl}
                          alt={result.username}
                          className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white font-bold text-base">
                            {result.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {result.displayName || result.username}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md flex-shrink-0 ${getRoleColor(result.role)}`}>
                            {getRoleLabel(result.role)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">@{result.username}</p>
                        {result.college && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 truncate font-medium">
                              {result.college.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* No results */}
            {hasSearched && !isSearching && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  No users found
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  No one matches &ldquo;{searchQuery}&rdquo;. Try a different name or username.
                </p>
              </div>
            )}

            {/* Initial prompt */}
            {!hasSearched && !isSearching && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  Find people
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Search by name or username to find people on CTN.
                </p>
              </div>
            )}
          </>
        )}

        {/* ─── Topics tab ──────────────────────────────────────────── */}
        {activeTab === 'topics' && (
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Trending right now
              </h2>
            </div>

            {topicsLoading ? (
              <ul className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="h-14 bg-slate-100 dark:bg-dark-800 rounded-xl animate-pulse" />
                ))}
              </ul>
            ) : trendingTopics && trendingTopics.length > 0 ? (
              <ul className="space-y-1.5">
                {trendingTopics.map((topic, index) => (
                  <motion.li
                    key={topic.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <button
                      onClick={() => {
                        setSearchQuery(topic.name)
                        setActiveTab('users')
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all text-left group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 bg-slate-100 dark:bg-dark-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                          <Hash className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate leading-tight">
                            {topic.name}
                          </p>
                          {topic.postCount > 0 && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {topic.postCount} {topic.postCount === 1 ? 'interaction' : 'interactions'}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-600 ml-2 flex-shrink-0">
                        #{index + 1}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-dark-800 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                  No trending topics yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Topics will appear here once posts start getting engagement.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </InstagramLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
