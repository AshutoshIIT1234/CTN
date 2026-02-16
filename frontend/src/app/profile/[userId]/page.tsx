'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore, UserRole } from '@/store/authStore'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit3, 
  Camera,
  MessageSquare,
  Heart,
  FileText,
  Mail,
  Shield,
  Users,
  BookOpen,
  Settings,
  ArrowLeft
} from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  displayName?: string
  email?: string // Only visible for own profile
  role: UserRole
  college?: {
    id: string
    name: string
    logoUrl: string
  }
  bio?: string
  profilePictureUrl?: string
  joinDate: Date
  stats: {
    postCount: number
    commentCount: number
    likesReceived: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: ''
  })

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
      
      const response = await api.get(`/users/profile/${userId}`)
      const profileData = response.data
      
      setProfile(profileData)
      setEditForm({
        displayName: profileData.displayName || '',
        bio: profileData.bio || ''
      })
    } catch (error: any) {
      console.error('Failed to fetch profile:', error)
      setError(error.response?.data?.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/users/profile', editForm)
      setProfile(response.data)
      setIsEditing(false)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setError(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profilePicture', file)

    try {
      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setProfile(prev => prev ? {
        ...prev,
        profilePictureUrl: response.data.profilePictureUrl
      } : null)
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error)
      setError(error.response?.data?.message || 'Failed to upload profile picture')
    }
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

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return Shield
      case UserRole.MODERATOR:
        return Shield
      case UserRole.COLLEGE_USER:
        return Users
      case UserRole.GENERAL_USER:
        return User
      default:
        return User
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="p-4">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {error || 'Profile not found'}
            </h3>
            <button
              onClick={() => router.back()}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const RoleIcon = getRoleIcon(profile.role)

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
            <div>
              <h1 className="text-xl font-bold">{profile.displayName || profile.username}</h1>
              <p className="text-sm text-gray-500">{profile.stats.postCount} posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="border-b border-gray-800">
        {/* Cover Photo Placeholder */}
        <div className="h-48 bg-gradient-to-r from-primary-900 to-primary-700"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-black"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-black">
                  <span className="text-white text-4xl font-bold">
                    {profile.username[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-black border border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-900 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit profile</span>
                </button>
              ) : (
                <>
                  <button className="px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-900 transition-colors">
                    Message
                  </button>
                  <button className="px-4 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                    Follow
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {profile.displayName || profile.username}
              </h1>
              <p className="text-gray-500">@{profile.username}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getRoleColor(profile.role)}`}>
                <RoleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{formatRole(profile.role)}</span>
              </div>
            </div>

            {/* Bio */}
            {isEditing ? (
              <div className="space-y-4 bg-gray-900 p-4 rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
                    placeholder="Your display name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="border border-gray-600 hover:bg-gray-900 text-white py-2 px-6 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {profile.bio && (
                  <p className="text-white text-lg leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-500">
              {profile.college && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.college.name}</span>
                </div>
              )}
              
              {isOwnProfile && profile.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-white">{profile.stats.postCount}</span>
                <span className="text-gray-500 ml-1">Posts</span>
              </div>
              <div>
                <span className="font-bold text-white">{profile.stats.commentCount}</span>
                <span className="text-gray-500 ml-1">Comments</span>
              </div>
              <div>
                <span className="font-bold text-white">{profile.stats.likesReceived}</span>
                <span className="text-gray-500 ml-1">Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button className="flex-1 py-4 text-center font-medium text-white border-b-2 border-primary-600">
            Posts
          </button>
          <button className="flex-1 py-4 text-center font-medium text-gray-500 hover:text-gray-300 transition-colors">
            Replies
          </button>
          <button className="flex-1 py-4 text-center font-medium text-gray-500 hover:text-gray-300 transition-colors">
            Media
          </button>
          <button className="flex-1 py-4 text-center font-medium text-gray-500 hover:text-gray-300 transition-colors">
            Likes
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-screen">
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {isOwnProfile ? "You haven't posted anything yet" : `@${profile.username} hasn't posted anything yet`}
          </h3>
          <p className="text-gray-500 mb-6">
            {isOwnProfile ? "Share your thoughts with the community!" : "When they do, their posts will show up here."}
          </p>
          {isOwnProfile && (
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Create your first post
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  )
}