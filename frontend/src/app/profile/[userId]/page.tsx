'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import api from '@/lib/api'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ContentTabs } from '@/components/profile/ContentTabs'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { FollowerListModal } from '@/components/profile/FollowerListModal'
import { PostGrid } from '@/components/post/PostGrid'
import { Bookmark, Tag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface UserProfile {
  id: string
  username: string
  displayName?: string
  email?: string // Only visible for own profile
  role: UserRole
  isFollowing?: boolean
  college?: {
    id: string
    name: string
    logoUrl: string
  }
  bio?: string
  profilePictureUrl?: string
  coverPhotoUrl?: string
  joinDate: Date
  stats: {
    postCount: number
    commentCount: number
    likesReceived: number
    followersCount: number
    followingCount: number
  }
}

type TabType = 'posts' | 'saved' | 'tagged'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false)
  const [followerModalTab, setFollowerModalTab] = useState<'followers' | 'following'>('followers')
  const [activeTab, setActiveTab] = useState<TabType>('posts')

  const userId = params.userId as string
  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchProfile()
  }, [userId, isAuthenticated])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get(`/users/${userId}/profile`)
      const profileData = response.data

      setProfile(profileData)
    } catch (error: any) {
      console.error('Failed to fetch profile:', error)
      setError(error.response?.data?.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user's posts
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/posts?page=1&limit=20`)
      return response.data
    },
    enabled: !!userId && activeTab === 'posts'
  })

  // Fetch saved posts
  const { data: savedPostsData, isLoading: savedPostsLoading } = useQuery({
    queryKey: ['saved-posts', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/saved?page=1`)
      return response.data
    },
    enabled: !!userId && activeTab === 'saved' && isOwnProfile
  })

  // Fetch tagged posts
  const { data: taggedPostsData, isLoading: taggedPostsLoading } = useQuery({
    queryKey: ['tagged-posts', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/tagged?page=1`)
      return response.data
    },
    enabled: !!userId && (activeTab === 'tagged' || !activeTab)
  })

  const handleSaveProfile = async (data: {
    displayName: string
    bio: string
    profilePictureUrl?: string
    coverPhotoUrl?: string
  }) => {
    const response = await api.put(`/users/${userId}/profile`, data)
    setProfile(response.data)
  }

  const handleProfilePictureUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post(`/users/${userId}/profile-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProfile(prev => prev ? {
        ...prev,
        profilePictureUrl: response.data.url
      } : null)
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error)
      setError(error.response?.data?.message || 'Failed to upload profile picture')
    }
  }

  const handleCoverPhotoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post(`/users/${userId}/cover-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProfile(prev => prev ? {
        ...prev,
        coverPhotoUrl: response.data.url
      } : null)
    } catch (error: any) {
      console.error('Failed to upload cover photo:', error)
      setError(error.response?.data?.message || 'Failed to upload cover photo')
    }
  }

  const handleStatsClick = (type: 'followers' | 'following') => {
    setFollowerModalTab(type)
    setIsFollowerModalOpen(true)
  }

  const handleFollow = async () => {
    if (!profile) return
    try {
      const isFollowing = profile.isFollowing

      // Optimistic update
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: !isFollowing,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount + (isFollowing ? -1 : 1)
        }
      } : null)

      if (isFollowing) {
        await api.delete(`/follow/${userId}`)
      } else {
        await api.post(`/follow/${userId}`)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
      // Revert on error - re-fetch profile to be safe
      fetchProfile()
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <InstagramLayout>
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark-950">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </InstagramLayout>
    )
  }

  if (error || !profile) {
    return (
      <InstagramLayout>
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-dark-950 min-h-screen">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            {error || 'Profile not found'}
          </h3>
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </InstagramLayout>
    )
  }

  return (
    <InstagramLayout>
      <div className="bg-white dark:bg-dark-950 min-h-screen">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setIsEditModalOpen(true)}
          onProfilePictureUpload={handleProfilePictureUpload}
          onCoverPhotoUpload={handleCoverPhotoUpload}
          onStatsClick={handleStatsClick}
          onFollowClick={handleFollow}
        />

        {/* Content Tabs */}
        <div className="max-w-4xl mx-auto">
          <ContentTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showSaved={isOwnProfile}
          />

          {/* Tab Content */}
          <div className="min-h-[400px] bg-white dark:bg-dark-950">
            {activeTab === 'posts' && (
              <PostGrid
                posts={postsData?.posts || []}
                loading={postsLoading}
              />
            )}

            {activeTab === 'saved' && (
              isOwnProfile ? (
                <PostGrid
                  posts={savedPostsData?.posts || []}
                  loading={savedPostsLoading}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 border-2 border-slate-900 dark:border-white rounded-full flex items-center justify-center mb-6">
                    <Bookmark className="w-10 h-10 text-slate-900 dark:text-white stroke-1" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Only {profile.displayName || profile.username} can see what they've saved</h3>
                </div>
              )
            )}

            {activeTab === 'tagged' && (
              <PostGrid
                posts={taggedPostsData?.posts || []}
                loading={taggedPostsLoading}
              />
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            profilePictureUrl: profile.profilePictureUrl,
            coverPhotoUrl: profile.coverPhotoUrl
          }}
          onSave={handleSaveProfile}
        />

        {/* Follower List Modal */}
        <FollowerListModal
          isOpen={isFollowerModalOpen}
          onClose={() => setIsFollowerModalOpen(false)}
          userId={userId}
          initialTab={followerModalTab}
        />
      </div>
    </InstagramLayout>
  )
}
