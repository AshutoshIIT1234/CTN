'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, User, MapPin, ArrowLeft, Hash, TrendingUp } from 'lucide-react'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
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

function SearchContent() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      performSearch(debouncedSearchQuery)
    } else {
      setSearchResults([])
      setHasSearched(false)
    }
  }, [debouncedSearchQuery])

  const performSearch = async (query: string) => {
    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      setSearchResults(response.data.users || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-700'
      case UserRole.MODERATOR:
        return 'bg-purple-100 text-purple-700'
      case UserRole.COLLEGE_USER:
        return 'bg-blue-100 text-blue-700'
      case UserRole.GENERAL_USER:
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const trendingTopics = [
    { name: 'Critical Thinking', posts: '12.5K', category: 'Education' },
    { name: 'Academic Resources', posts: '8,234', category: 'Education' },
    { name: 'College Discussion', posts: '5,678', category: 'Education' },
    { name: 'Philosophy', posts: '4,321', category: 'Philosophy' },
    { name: 'AI in Education', posts: '2,987', category: 'Technology' },
    { name: 'Ethics & Morality', posts: '2,456', category: 'Philosophy' }
  ]

  return (
    <InstagramLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-slate-50 dark:border-dark-800">
        <div className="px-6 py-0">
          <div className="flex items-center gap-6 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Explore Network</h1>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-6 py-6 border-b border-slate-50 dark:border-dark-800 bg-slate-50/30 dark:bg-dark-900/30">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search Critical Thinking Network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[20px] bg-white dark:bg-dark-800 border-2 border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-50 dark:border-dark-800 bg-white dark:bg-dark-900">
        <div className="flex px-2">
          {['users', 'posts', 'topics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-5 text-center transition-all relative group`}
            >
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}>
                {tab === 'users' ? 'Human Nodes' : tab === 'posts' ? 'Intel Data' : 'Signatures'}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="searchTabActive"
                  className="absolute bottom-0 left-4 right-4 h-1 bg-blue-600 dark:bg-blue-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#3B82F6' }}></div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !isLoading && (
          <>
            {hasSearched && searchResults.length === 0 && (
              <div className="py-32 text-center px-6">
                <div className="w-24 h-24 bg-slate-50 dark:bg-dark-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative overflow-hidden">
                  <User className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">
                  No Signals Found
                </h3>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
                  The query "{searchQuery}" returned zero matches in the peer directory.
                </p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleUserClick(result.id)}
                    className="group border-b border-slate-50 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-all cursor-pointer p-6"
                  >
                    <div className="flex items-center gap-3">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {result.profilePictureUrl ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rotate-0 group-hover:rotate-3 transition-transform duration-300">
                            <img
                              src={result.profilePictureUrl}
                              alt={result.username}
                              className="w-full h-full rounded-[14px] object-cover border-2 border-white dark:border-dark-900"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-dark-900"
                            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
                          >
                            <span className="text-white text-xl font-black">
                              {result.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
                            {result.displayName || result.username}
                          </h3>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${getRoleColor(result.role)}`}>
                            {formatRole(result.role)}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-2 truncate tracking-tight">@{result.username}</p>
                        {result.college && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 w-fit px-3 py-1 rounded-full">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{result.college.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!hasSearched && (
              <div className="py-40 text-center px-6">
                <div className="w-28 h-28 bg-slate-50 dark:bg-dark-800 rounded-[40px] flex items-center justify-center mx-auto mb-10 relative overflow-hidden group/search-icon">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-transparent group-hover/search-icon:rotate-12 transition-transform duration-1000" />
                  <Search className="w-12 h-12 text-slate-200 dark:text-slate-700 relative z-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
                  Node Discovery
                </h3>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-xs max-w-sm mx-auto leading-loose">
                  Enter credentials to scan the national discourse network for specific peer identities.
                </p>
              </div>
            )}
          </>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && !isLoading && (
          <div className="py-40 text-center px-6 bg-slate-50/20 dark:bg-dark-900/20">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 rounded-full mb-8">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Expansion in Progress</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">
              Intel Indexing
            </h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-xs max-w-sm mx-auto leading-loose">
              The global post archives are currently undergoing deep vector indexing. Query functionality pending.
            </p>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && !isLoading && (
          <div>
            {searchQuery.trim() ? (
              <div className="py-32 text-center px-6">
                <div className="w-20 h-20 bg-slate-50 dark:bg-dark-800 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
                  <Hash className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">
                  No Domain Match
                </h3>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
                  The signature "{searchQuery}" has not been registered in the global taxonomy.
                </p>
              </div>
            ) : (
              <div className="px-6 py-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">High-Engagement</h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Global Discourse Statistics</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSearchQuery(topic.name.toLowerCase())}
                      className="group flex items-center justify-between p-5 rounded-[24px] bg-white dark:bg-dark-900 border border-transparent hover:border-slate-100 dark:hover:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:shadow-none"
                    >
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{topic.category} · Sector Alpha</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">#{topic.name}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">{topic.posts} Active Threads</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-2xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:rotate-12 transition-all duration-300">
                        <Hash className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
