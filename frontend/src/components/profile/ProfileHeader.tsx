'use client'

import { Settings, MoreHorizontal, Camera } from 'lucide-react'
import { UserRole } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { ProfileActions } from './ProfileActions'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  username: string
  displayName?: string
  email?: string
  role: UserRole
  isFollowing?: boolean
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
    followersCount: number
    followingCount: number
  }
}

interface ProfileHeaderProps {
  profile: UserProfile
  isOwnProfile: boolean
  onEditClick: () => void
  onProfilePictureUpload: (file: File) => Promise<void>
  onStatsClick: (type: 'followers' | 'following') => void
  onFollowClick?: () => void
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEditClick,
  onProfilePictureUpload,
  onStatsClick,
  onFollowClick
}: ProfileHeaderProps) {
  const router = useRouter()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await onProfilePictureUpload(file)
    }
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">

          {/* Profile Picture Column */}
          <div className="flex justify-center md:justify-start flex-shrink-0">
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden ring-1 ring-gray-200 shadow-lg">
                {profile.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
                    <span className="text-white text-3xl md:text-6xl font-bold drop-shadow-lg">
                      {profile.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-200">
                  <Camera className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
                  <span className="text-white text-xs font-semibold">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </motion.div>
          </div>

          {/* Info Column */}
          <div className="flex-grow min-w-0">

            {/* Top Row: Username + Buttons */}
            <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-8 mb-6">
              <h1 className="text-xl md:text-3xl font-light text-gray-900 tracking-tight">{profile.username}</h1>

              <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                <ProfileActions
                  isOwnProfile={isOwnProfile}
                  isFollowing={profile.isFollowing}
                  onEditClick={onEditClick}
                  onFollowClick={onFollowClick}
                  targetUserId={profile.id}
                />
                
                {isOwnProfile && (
                  <motion.button
                    onClick={() => router.push('/settings')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label="Settings"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="w-6 h-6 text-gray-700" />
                  </motion.button>
                )}
                
                {!isOwnProfile && (
                  <motion.button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label="More options"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MoreHorizontal className="w-6 h-6 text-gray-700" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Middle Row: Stats */}
            <div className="flex justify-center md:justify-start gap-8 md:gap-12 mb-6">
              <div className="text-center md:text-left">
                <div className="text-lg md:text-xl font-semibold text-gray-900">{profile.stats.postCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">posts</div>
              </div>
              <motion.button
                className="text-center md:text-left"
                onClick={() => onStatsClick('followers')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-lg md:text-xl font-semibold text-gray-900">{profile.stats.followersCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">followers</div>
              </motion.button>
              <motion.button
                className="text-center md:text-left"
                onClick={() => onStatsClick('following')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-lg md:text-xl font-semibold text-gray-900">{profile.stats.followingCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">following</div>
              </motion.button>
            </div>

            {/* Bottom Row: Bio */}
            <div className="text-sm text-center md:text-left max-w-full md:max-w-lg">
              {profile.displayName && (
                <div className="font-semibold text-gray-900 mb-2 text-base">{profile.displayName}</div>
              )}

              {profile.college && (
                <div className="text-gray-600 mb-3 flex items-center justify-center md:justify-start gap-2">
                  <span className="text-lg">🏛️</span>
                  <span className="font-medium">{profile.college.name}</span>
                </div>
              )}

              {profile.bio && (
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{profile.bio}</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
