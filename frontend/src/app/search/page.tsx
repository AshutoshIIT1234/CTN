'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, User, MapPin, ArrowLeft, Hash, TrendingUp } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
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
    <MainLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white backdrop-blur-xl" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="px-4 py-0">
          <div className="flex items-center gap-8 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#111827' }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Explore</h1>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: '#6B7280' }} />
          </div>
          <input
            type="text"
            placeholder="Search Critical Thinking Network"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full focus:ring-2 focus:outline-none"
            style={{ 
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              color: '#111827'
            }}
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex">
          <button
            onClick={() => setActiveTab('users')}
            className="flex-1 py-4 text-center font-medium transition-colors relative"
            style={{ color: activeTab === 'users' ? '#111827' : '#6B7280' }}
          >
            People
            {activeTab === 'users' && (
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 rounded-full"
                style={{ backgroundColor: '#3B82F6' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className="flex-1 py-4 text-center font-medium transition-colors relative"
            style={{ color: activeTab === 'posts' ? '#111827' : '#6B7280' }}
          >
            Posts
            {activeTab === 'posts' && (
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 rounded-full"
                style={{ backgroundColor: '#3B82F6' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className="flex-1 py-4 text-center font-medium transition-colors relative"
            style={{ color: activeTab === 'topics' ? '#111827' : '#6B7280' }}
          >
            Topics
            {activeTab === 'topics' && (
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 rounded-full"
                style={{ backgroundColor: '#3B82F6' }}
              />
            )}
          </button>
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
              <div className="text-center py-16">
                <User className="h-16 w-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>
                  No people found for "{searchQuery}"
                </h3>
                <p style={{ color: '#6B7280' }}>
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
                    className="hover:bg-gray-50 transition-colors cursor-pointer p-4"
                    style={{ borderBottom: '1px solid #E5E7EB' }}
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
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
                          >
                            <span className="text-white text-lg font-semibold">
                              {result.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold truncate" style={{ color: '#111827' }}>
                            {result.displayName || result.username}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getRoleColor(result.role)}`}>
                            {formatRole(result.role)}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-1" style={{ color: '#6B7280' }}>@{result.username}</p>

                        {result.college && (
                          <div className="flex items-center gap-1 text-sm" style={{ color: '#6B7280' }}>
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
                <Search className="h-16 w-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>
                  Search for people
                </h3>
                <p style={{ color: '#6B7280' }}>
                  Find other users by their username, display name, or college.
                </p>
              </div>
            )}
          </>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && !isLoading && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>
              Post search coming soon
            </h3>
            <p style={{ color: '#6B7280' }}>
              We're working on adding the ability to search through posts.
            </p>
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && !isLoading && (
          <div>
            {searchQuery.trim() ? (
              <div className="text-center py-16">
                <Hash className="h-16 w-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>
                  No topics found for "{searchQuery}"
                </h3>
                <p style={{ color: '#6B7280' }}>
                  Try searching for something else or browse trending topics below.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#3B82F6' }} />
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
                      className="hover:bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#6B7280' }}>{topic.category} · Trending</p>
                          <p className="font-bold" style={{ color: '#111827' }}>{topic.name}</p>
                          <p className="text-sm" style={{ color: '#6B7280' }}>{topic.posts} posts</p>
                        </div>
                        <Hash className="w-5 h-5" style={{ color: '#9CA3AF' }} />
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
