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
  PlusSquare,
  LogOut,
  Brain,
  LogIn
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { CreatePostModal } from '../post/CreatePostModal'

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const menuItems = [
    { icon: Home, label: 'National', href: '/', auth: false },
    { icon: Building2, label: 'College', href: '/college', auth: true },
    { icon: BookOpen, label: 'Resources', href: '/resources', auth: true },
    { icon: Bell, label: 'Notifications', href: '/notifications', auth: true },
    { icon: TrendingUp, label: 'Trending', href: '/trending', auth: false },
    { icon: User, label: 'Profile', href: '/profile', auth: true },
    { icon: Settings, label: 'Settings', href: '/settings', auth: true },
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside className="w-60 h-screen sticky top-0 border-r border-gray-200 bg-white">
      <div className="flex flex-col h-full p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 bg-gradient-to-br from-royal-500 to-primary-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">CTN</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isLocked = item.auth && !user

            return (
              <Link
                key={item.href}
                href={isLocked ? '#' : item.href}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault()
                    router.push('/auth/login')
                  }
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-royal-50 text-royal-600 font-semibold'
                    : isLocked
                    ? 'text-gray-400 hover:bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-base">{item.label}</span>
                {isLocked && (
                  <span className="ml-auto text-xs text-gray-400">🔒</span>
                )}
              </Link>
            )
          })}

          {/* Create Post Button */}
          {user && (
            <Link
              href="/create-post"
              className="flex items-center gap-4 px-4 py-3 rounded-lg bg-royal-600 text-white hover:bg-royal-700 transition-all font-semibold shadow-lg shadow-royal-200"
            >
              <PlusSquare className="w-6 h-6" />
              <span className="text-base">Create Post</span>
            </Link>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-gray-200">
          {user ? (
            <>
              {/* User Profile */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.username}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-base">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-royal-600 text-white hover:bg-royal-700 transition-all font-semibold"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => {
          // Refresh the feed
          router.refresh()
        }}
      />
    </aside>
  )
}
