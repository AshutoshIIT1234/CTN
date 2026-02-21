'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  BookOpen, 
  Search, 
  Bell, 
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Shield,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  TrendingUp
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useState } from 'react'
import { TrendingSection } from '@/components/trending/TrendingSection'
import { MobileBottomNav } from './MobileBottomNav'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import Link from 'next/link'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const navigation = [
    { 
      name: 'National', 
      href: '/', 
      icon: Sparkles, 
      show: true,
      enabled: true,
      description: 'National discussion panel for critical discourse'
    },
    { 
      name: 'College', 
      href: '/college', 
      icon: Users, 
      show: true,
      enabled: user?.role === UserRole.COLLEGE_USER || user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN,
      description: 'Private college-specific discussion space'
    },
    { 
      name: 'Resources', 
      href: '/resources', 
      icon: BookOpen, 
      show: true,
      enabled: user?.role === UserRole.COLLEGE_USER || user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN,
      description: 'Hierarchical academic resource repository'
    },
    { 
      name: 'Explore', 
      href: '/search', 
      icon: Search, 
      show: true,
      enabled: true,
      description: 'Search and discover content'
    },
    { name: 'Notifications', href: '/notifications', icon: Bell, show: !!user, enabled: !!user },
    { 
      name: 'Trending', 
      href: '/trending', 
      icon: TrendingUp, 
      show: true,
      enabled: true,
      description: 'Trending topics and discussions'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User, 
      show: !!user,
      enabled: !!user,
      description: 'Your personal profile and settings'
    },
    { name: 'Settings', href: '/settings', icon: Settings, show: !!user, enabled: !!user },
  ]

  const mainNavigation = navigation.slice(0, 8)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FB' }}>
      {/* Desktop: Three-column grid layout */}
      <div className="hidden lg:grid lg:grid-cols-[240px_680px_320px] lg:gap-6 lg:max-w-[1264px] lg:mx-auto">
        {/* Left Sidebar - Use Sidebar component */}
        <Sidebar />

        {/* Main Content Area - 680px */}
        <main className="w-[680px] min-h-screen bg-white" style={{ borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
          {children}
        </main>

        {/* Right Sidebar - Use RightPanel component */}
        <RightPanel />
      </div>

      {/* Tablet: Two-column layout (Icon Sidebar + Main) */}
      <div className="hidden md:grid lg:hidden md:grid-cols-[80px_1fr] md:gap-6 md:max-w-[920px] md:mx-auto">
        {/* Icon-only Sidebar */}
        <div className="w-[80px] px-2 py-4 fixed h-full bg-white" style={{ borderRight: '1px solid #E5E7EB' }}>
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </Link>
            {mainNavigation.filter(item => item.show && item.enabled).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="p-3 rounded-xl hover:bg-gray-50 transition-colors"
                title={item.name}
              >
                <item.icon className="w-6 h-6" style={{ color: '#6B7280' }} />
              </Link>
            ))}
          </div>
        </div>

        <main className="ml-[80px] min-h-screen bg-white" style={{ borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
          {children}
        </main>
      </div>

      {/* Mobile: Single column with bottom nav */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-6 h-6" style={{ color: '#111827' }} />
            </button>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </Link>

            {user ? (
              <Link href="/profile" className="p-2 rounded-full hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                  <span className="text-white text-sm font-semibold">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/auth/login" className="font-bold py-2 px-4 rounded-full text-sm" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', color: 'white' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        <main className="min-h-screen pb-20 bg-white">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="w-80 h-full bg-white p-4"
            style={{ borderRight: '1px solid #E5E7EB' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#111827' }}>CTN</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <X className="w-6 h-6" style={{ color: '#111827' }} />
              </button>
            </div>

            <nav className="space-y-4">
              <div>
                <div className="px-3 py-2 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>Main</h3>
                </div>
                <div className="space-y-2">
                  {mainNavigation.filter(item => item.show).map((item) => (
                    <Link
                      key={item.name}
                      href={item.enabled ? item.href : '#'}
                      onClick={(e) => {
                        if (!item.enabled) {
                          e.preventDefault()
                        } else {
                          setIsMobileMenuOpen(false)
                        }
                      }}
                      className={`flex items-center gap-4 px-3 py-3 rounded-xl text-base transition-colors ${
                        item.enabled 
                          ? 'hover:bg-gray-50' 
                          : 'cursor-not-allowed'
                      }`}
                      style={{
                        color: item.enabled ? '#111827' : '#9CA3AF',
                        opacity: item.enabled ? 1 : 0.5
                      }}
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.name}</span>
                      {!item.enabled && (
                        <div className="ml-auto">
                          <span className="text-sm">🔒</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {user && (
              <div className="mt-8 pt-8" style={{ borderTop: '1px solid #E5E7EB' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                    <span className="text-white font-semibold">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#111827' }}>{user.displayName || user.username}</p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
