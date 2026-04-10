'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Building2,
  BookOpen,
  Bell,
  TrendingUp,
  User as UserIcon,
  Settings,
  LogIn,
  PenSquare,
  MessageSquare,
  Search,
  Lock,
  Crown,
  ChevronRight,
  Sparkles,
  LogOut,
  Shield,
  Star,
  Globe,
  Sun,
  Moon,
  Monitor,
  Brain,
  User,
  UsersRound,
  UserCheck,
  LayoutDashboard,
  Newspaper,
  GraduationCap,
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { CreatePostModal } from '../post/CreatePostModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { useQueryClient } from '@tanstack/react-query'

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const isEliteInstitute = (name: string) => {
    if (!name) return false;
    return name.includes('IIT') || name.includes('IIM') || name.includes('AIIMS') || name.includes('NIT') || name.includes('IIIT');
  };

  const getEliteLabel = (name: string) => {
    if (name.includes('IIT')) return 'IITian Scholar';
    if (name.includes('IIM')) return 'IIM Scholar';
    if (name.includes('AIIMS')) return 'AIIMS Scholar';
    if (name.includes('NIT')) return 'NITian Scholar';
    if (name.includes('IIIT')) return 'IIITian Scholar';
    return 'Scholar';
  };

  const mainMenuItems = [
    { icon: Home, label: 'National', href: '/', auth: false },
    { icon: Building2, label: 'College', href: '/college', auth: true },
    { icon: BookOpen, label: 'Resources', href: '/resources', auth: true },
    { icon: Search, label: 'Explore', href: '/search', auth: false },
    { icon: MessageSquare, label: 'Messages', href: '/messages', auth: true },
    { icon: Bell, label: 'Notifications', href: '/notifications', auth: true },
    { icon: TrendingUp, label: 'Trending', href: '/trending', auth: false },
    { icon: UserIcon, label: 'Profile', href: `/profile/${user?.id || ''}`, auth: true },
    { icon: Settings, label: 'Settings', href: '/settings', auth: true },
  ]

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Admin Hub',     href: '/admin',            roles: [UserRole.ADMIN]                        },
    { icon: UsersRound,      label: 'Users',          href: '/admin/users',      roles: [UserRole.ADMIN]                        },
    { icon: UserCheck,       label: 'Moderators',     href: '/admin/moderators', roles: [UserRole.ADMIN]                        },
    { icon: GraduationCap,   label: 'Colleges',       href: '/admin/colleges',   roles: [UserRole.ADMIN]                        },
    { icon: Newspaper,       label: 'Posts',          href: '/admin/posts',      roles: [UserRole.ADMIN]                        },
    { icon: BookOpen,        label: 'Resources',      href: '/admin/resources',  roles: [UserRole.ADMIN]                        },
    { icon: Shield,          label: 'Moderator Hub',  href: '/moderator',        roles: [UserRole.MODERATOR]                    },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleCreatePost = () => {
    if (!user) {
      router.push('/auth/login')
    } else {
      setShowCreateModal(true)
    }
  }

  const handleNavClick = (item: any, e: React.MouseEvent) => {
    if (item.auth && !user) {
      e.preventDefault()
      router.push('/auth/login')
    }
  }

  return (
    <aside className="w-[260px] h-screen sticky top-0 bg-white dark:bg-dark-900 flex flex-col px-5 py-6 border-r border-gray-100 dark:border-dark-800">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 mb-8 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              CTN
            </span>
            <span className="text-[10px] font-semibold text-blue-500 tracking-widest mt-0.5">Critical Thinking Network</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto hide-scrollbar">
          {!(pathname.startsWith('/admin') || pathname.startsWith('/moderator')) && mainMenuItems.filter(item => {
            if (item.label === 'College' || item.label === 'Resources') {
              return user && (user.role === UserRole.COLLEGE_USER || user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR)
            }
            return true
          }).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isLocked = item.auth && !user

            return (
              <Link
                key={item.href}
                href={isLocked ? '#' : item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group overflow-hidden ${isActive
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                  />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors'}`} />
                <span className={`text-sm font-semibold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`}>
                  {item.label}
                </span>

                {isLocked && (
                  <Lock className="w-3.5 h-3.5 ml-auto text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                )}

                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-blue-300 dark:text-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            )
          })}

          {/* Admin/Moderator Section */}
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR) && (
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-dark-800">
              <span className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 block">Management</span>
              {adminMenuItems.filter(item => item.roles.includes(user.role)).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative group ${isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeAdminNav"
                        className="absolute left-0 w-1.5 h-5 bg-indigo-500 rounded-r-full"
                      />
                    )}
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'}`} />
                    <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
          {/* Theme Switcher Toggle */}
          <div className="px-2 py-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex bg-slate-50 dark:bg-dark-800/50 p-1 rounded-2xl border border-slate-100 dark:border-white/5 relative">
              {[
                { id: 'light', icon: Sun },
                { id: 'system', icon: Monitor },
                { id: 'dark', icon: Moon },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id as any)}
                  className={`flex-1 flex items-center justify-center py-2 relative z-10 transition-colors ${theme === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
                >
                  <opt.icon className="w-4 h-4" />
                  {theme === opt.id && (
                    <motion.div
                      layoutId="theme-pill"
                      className="absolute inset-0 bg-white dark:bg-dark-700 rounded-xl shadow-sm -z-10"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
          {/* Enhanced Action Button */}
          {!(pathname.startsWith('/admin') || pathname.startsWith('/moderator')) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreatePost}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
            >
              <PenSquare className="w-4 h-4" />
              <span>Create Post</span>
            </motion.button>
          )}

          {/* User Profile Section */}
          {user ? (
            <div className="transition-all duration-500 opacity-100 scale-100">
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-3xl border border-white/5 rounded-[24px] p-4 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <Link href="/profile" className="flex items-center gap-3 mb-4 relative z-10 group/profile">
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[14px] flex items-center justify-center border border-white/10 shadow-lg overflow-hidden">
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Brain className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {user.isPremium && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#0f172a] shadow-lg flex items-center justify-center">
                        <Star className="w-2 h-2 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover/profile:text-blue-400 transition-colors">
                      {user.displayName || user.username}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'ADMIN' ? 'bg-rose-500' : user.role === 'MODERATOR' ? 'bg-purple-500' : user.role === 'COLLEGE_USER' ? (isEliteInstitute(user.college?.name || '') ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-blue-500'}`} />
                      <p className={`text-[10px] font-medium ${isEliteInstitute(user.college?.name || '') ? 'text-amber-400' : 'text-slate-400'}`}>
                        {user.role === 'COLLEGE_USER'
                          ? getEliteLabel(user.college?.name || '')
                          : user.role === 'GENERAL_USER'
                          ? 'Member'
                          : user.role === 'ADMIN'
                          ? 'Admin'
                          : user.role === 'MODERATOR'
                          ? 'Moderator'
                          : user.role}
                      </p>
                      {isEliteInstitute(user.college?.name || '') && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400/30 ml-0.5" />}
                    </div>
                  </div>
                </Link>

                {user.college && (
                  <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 mb-4">
                    <Globe className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium truncate">
                      {user.college.name}
                    </span>
                  </div>
                )}

                <div className={`grid ${(pathname.startsWith('/admin') || pathname.startsWith('/moderator')) ? 'grid-cols-1' : 'grid-cols-2'} gap-2 relative z-10`}>
                  {!(pathname.startsWith('/admin') || pathname.startsWith('/moderator')) && (
                    <button
                      onClick={() => router.push('/profile')}
                      className="flex items-center justify-center gap-2 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all group/btn"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" />
                      <span className="text-[10px] font-semibold text-slate-400 group-hover/btn:text-white">Profile</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500 group/logout border border-rose-500/20 rounded-xl transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover/logout:text-white transition-colors" />
                    <span className="text-[10px] font-semibold text-rose-500 group-hover/logout:text-white">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 border border-white/10 hover:border-blue-500/50 hover:text-blue-400 transition-all text-white"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => {
          setShowCreateModal(false)
          queryClient.invalidateQueries({ queryKey: ['national-feed'] })
          if (user?.collegeId) {
            queryClient.invalidateQueries({ queryKey: ['college-feed'] })
          }
          router.refresh()
        }}
      />
    </aside>
  )
}
