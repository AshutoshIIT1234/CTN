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
  User, 
  Settings, 
  LogIn,
  PenSquare,
  MessageSquare,
  Search,
  Lock
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { CreatePostModal } from '../post/CreatePostModal'

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const mainMenuItems = [
    { icon: Home, label: 'National', href: '/', auth: false },
    { icon: Building2, label: 'College', href: '/college', auth: true },
    { icon: BookOpen, label: 'Resources', href: '/resources', auth: true },
    { icon: Search, label: 'Explore', href: '/search', auth: false },
    { icon: Bell, label: 'Notifications', href: '/notifications', auth: true },
    { icon: TrendingUp, label: 'Trending', href: '/trending', auth: false },
    { icon: User, label: 'Profile', href: '/profile', auth: true },
    { icon: Settings, label: 'Settings', href: '/settings', auth: true },
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

  const handleNavClick = (item: typeof mainMenuItems[0], e: React.MouseEvent) => {
    if (item.auth && !user) {
      e.preventDefault()
      router.push('/auth/login')
    }
  }

  return (
    <aside className="w-[240px] h-screen sticky top-0 bg-white flex-col px-4 py-4" style={{ borderRight: '1px solid #E5E7EB' }}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" 
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
          >
            <span className="text-white font-bold text-lg">✨</span>
          </div>
          <span className="text-xl font-bold" style={{ color: '#111827' }}>
            CTN
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isLocked = item.auth && !user

            return (
              <Link
                key={item.href}
                href={isLocked ? '#' : item.href}
                onClick={(e) => handleNavClick(item, e)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group"
                style={{
                  backgroundColor: isActive ? '#E8F0FF' : 'transparent',
                  color: isActive ? '#3B82F6' : (isLocked ? '#9CA3AF' : '#6B7280'),
                  fontWeight: isActive ? 600 : 400,
                  opacity: isLocked ? 0.5 : 1
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[15px]">
                  {item.label}
                </span>
                {isLocked && (
                  <Lock className="w-3 h-3 ml-auto" style={{ color: '#9CA3AF' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Create/Post Button */}
          <button
            onClick={handleCreatePost}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
            style={{ backgroundColor: '#3B82F6', color: 'white' }}
          >
            <PenSquare className="w-5 h-5" />
            <span>Create</span>
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative group">
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
                >
                  <span className="text-white font-semibold text-sm">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                    {user.username}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#6B7280' }}>
                    @{user.username.toLowerCase()}
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] shadow-sm transition-all duration-200"
              style={{ backgroundColor: '#3B82F6', color: 'white' }}
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => {
          setShowCreateModal(false)
          router.refresh()
        }}
      />
    </aside>
  )
}
