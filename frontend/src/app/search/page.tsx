'use client'

import { useState, useEffect } from 'react'
import { Search, User, MapPin, ArrowLeft, Hash, TrendingUp } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import api from '@/lib/api'

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

export default function SearchPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

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
        return 'bg-red-900/30 text-red-400'
      case UserRole.MODERATOR:
        return 'bg-purple-900/30 text-purple-400'
      case UserRole.COLLEGE_USER:
        return 'bg-blue-900/30 text-blue-400'
      case UserRole.GENERAL_USER:
        return 'bg-green-900/30 text-green-400'
      default:
        return 'bg-gray-900/30 text-gray-400'
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

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <MainLayout>
      {/* Header - X.com style */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-0">
          <div className="flex items-center gap-8 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Search</h1>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="border-b border-gray-800 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search Critical Thinking Network"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500"
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'users' 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            People
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-primary-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'posts' 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Posts
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-primary-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'topics' 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Topics
            {activeTab === 'topics' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !isLoading && (
          <>
            {hasSearched && searchResults.length === 0 && (
              <div className="text-center py-16">
                <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No people found for "{searchQuery}"
                </h3>
                <p className="text-gray-500">
                  Try searching for something else.
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
                    className="border-b border-gray-800 hover:bg-gray-950/50 transition-colors cursor-pointer p-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {result.profilePictureUrl ? (
                          <img
                            src={result.profilePictureUrl}
                            alt={result.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white text-lg font-semibold">
                              {result.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white truncate">
                            {result.displayName || result.username}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getRoleColor(result.role)}`}>
                            {formatRole(result.role)}
                          </span>
                        </div>
                        
                        <p className="text-gray-500 text-sm mb-1">@{result.username}</p>

                        {result.college && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{result.college.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Search for people
                </h3>
                <p className="text-gray-500">
                  Find other users by their username, display name, or college.
                </p>
              </div>
            )}
          </>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && !isLoading && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Post search coming soon
            </h3>
            <p className="text-gray-500">
              We're working on adding the ability to search through posts.
            </p>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && !isLoading && (
          <div>
            {searchQuery.trim() ? (
              <div className="text-center py-16">
                <Hash className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No topics found for "{searchQuery}"
                </h3>
                <p className="text-gray-500">
                  Try searching for something else or browse trending topics below.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  Trending topics
                </h2>
                <div className="space-y-1">
                  {trendingTopics.map((topic, index) => (
                    <motion.div
                      key={topic.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSearchQuery(topic.name.toLowerCase())}
                      className="hover:bg-gray-950/50 p-3 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">{topic.category} · Trending</p>
                          <p className="font-bold text-white">{topic.name}</p>
                          <p className="text-gray-500 text-sm">{topic.posts} posts</p>
                        </div>
                        <Hash className="w-5 h-5 text-gray-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}