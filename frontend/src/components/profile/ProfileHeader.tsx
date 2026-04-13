'use client'

import { Settings, MoreHorizontal, Camera, Crown, ShieldCheck, MapPin, GraduationCap, Calendar } from 'lucide-react'
import { UserRole } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { ProfileActions } from './ProfileActions'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

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
  coverPhotoUrl?: string
  isPremium?: boolean
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
  onCoverPhotoUpload: (file: File) => Promise<void>
  onStatsClick: (type: 'followers' | 'following') => void
  onFollowClick?: () => void
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEditClick,
  onProfilePictureUpload,
  onCoverPhotoUpload,
  onStatsClick,
  onFollowClick
}: ProfileHeaderProps) {
  const router = useRouter()

  const handleProfileFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await onProfilePictureUpload(file)
    }
  }

  const handleCoverFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await onCoverPhotoUpload(file)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-950 overflow-hidden">
      {/* Cover/Header Area */}
      <div className="h-56 md:h-80 bg-slate-100 dark:bg-dark-900 relative overflow-hidden group/cover">
        {profile.coverPhotoUrl ? (
          <img src={profile.coverPhotoUrl} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>
        )}

        {isOwnProfile && (
          <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer z-20">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <span className="text-white text-[12px] font-black uppercase tracking-[0.3em] mt-4">Update Neural Banner</span>
            <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
          </label>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-12 -mt-20 md:-mt-24 relative z-10 pb-12">
        <div className="flex flex-col md:flex-row items-end md:items-start gap-8 md:gap-12">

          {/* Avatar Area */}
          <div className="relative group mx-auto md:mx-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] p-1 bg-white dark:bg-dark-950 shadow-2xl relative overflow-hidden"
            >
              <div className="w-full h-full rounded-[36px] overflow-hidden bg-slate-50 dark:bg-dark-800 flex items-center justify-center relative">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-4xl md:text-6xl font-black text-blue-600/20">
                    {profile.username[0].toUpperCase()}
                  </span>
                )}

                {isOwnProfile && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest mt-1">Update</span>
                    <input type="file" accept="image/*" onChange={handleProfileFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </motion.div>

            {profile.isPremium && (
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center border-4 border-white dark:border-dark-900 shadow-xl">
                <Crown className="w-5 h-5 text-white fill-white" />
              </div>
            )}
          </div>

          {/* User Meta Area */}
          <div className="flex-1 md:mt-24 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {profile.displayName || profile.username}
                  </h1>
                  <ShieldCheck className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="text-slate-400 font-bold text-sm">@{profile.username}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-1 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {format(new Date(profile.joinDate), 'MMM yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4 md:mt-0 md:ml-auto w-full md:w-auto">
                <ProfileActions
                  isOwnProfile={isOwnProfile}
                  isFollowing={profile.isFollowing}
                  onEditClick={onEditClick}
                  onFollowClick={onFollowClick}
                  targetUserId={profile.id}
                />
                <button className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-dark-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all border border-slate-100 dark:border-dark-700">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all border border-blue-100 dark:border-blue-500/20"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bio & Links */}
            <div className="max-w-2xl mb-8 space-y-4">
              {profile.bio && (
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                {profile.college && (
                  <div className="flex items-center gap-2 group cursor-default">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-dark-800 flex items-center justify-center text-indigo-600">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black text-slate-500 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {profile.college.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 group cursor-default">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-dark-800 flex items-center justify-center text-blue-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-slate-500 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                    National Think Tank
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center md:justify-start gap-6 md:gap-12 border-t border-slate-50 dark:border-slate-900 pt-8 w-full overflow-x-auto">
              <div className="text-center md:text-left">
                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{profile.stats.postCount.toLocaleString()}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Theses Published</div>
              </div>
              <button
                onClick={() => onStatsClick('followers')}
                className="text-center md:text-left hover:opacity-70 transition-opacity"
              >
                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{profile.stats.followersCount.toLocaleString()}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Thinkers Connected</div>
              </button>
              <button
                onClick={() => onStatsClick('following')}
                className="text-center md:text-left hover:opacity-70 transition-opacity"
              >
                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{profile.stats.followingCount.toLocaleString()}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ideologies Followed</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
