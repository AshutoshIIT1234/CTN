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
  MoreHorizontal
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useState } from 'react'
import { TrendingSection } from '@/components/trending/TrendingSection'
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
      name: 'Critical Thinking', 
      href: '/feed', 
      icon: Sparkles, 
      show: true,
      enabled: true,
      description: 'National discussion panel for critical discourse'
    },
    { 
      name: 'Academic Resources', 
      href: '/resources', 
      icon: BookOpen, 
      show: true,
      enabled: user?.role === UserRole.COLLEGE_USER || user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN,
      description: 'Hierarchical academic resource repository'
    },
    { 
      name: 'College Discussion', 
      href: '/college', 
      icon: Users, 
      show: true,
      enabled: user?.role === UserRole.COLLEGE_USER || user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN,
      description: 'Private college-specific discussion space'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User, 
      show: !!user,
      enabled: !!user,
      description: 'Your personal profile and settings'
    },
    { 
      name: 'Explore', 
      href: '/search', 
      icon: Search, 
      show: true,
      enabled: true,
      description: 'Search and discover content'
    },
    // Additional navigation items (shown after main sections)
    { name: 'Notifications', href: '/notifications', icon: Bell, show: !!user, enabled: !!user },
    { name: 'Messages', href: '/messages', icon: Mail, show: !!user, enabled: !!user },
    { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark, show: !!user, enabled: !!user },
    { 
      name: 'Moderator', 
      href: '/moderator', 
      icon: Shield, 
      show: user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN,
      enabled: user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN
    },
    { 
      name: 'Admin', 
      href: '/admin', 
      icon: Settings, 
      show: user?.role === UserRole.ADMIN,
      enabled: user?.role === UserRole.ADMIN
    }
  ]

  // Separate main navigation from additional items
  const mainNavigation = navigation.slice(0, 5) // Critical Thinking through Explore (removed Home)
  const additionalNavigation = navigation.slice(5) // Notifications, Messages, etc.

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - X.com style */}
        <div className="hidden lg:flex flex-col w-64 xl:w-80 px-4 py-4 fixed h-full">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-900 transition-colors w-fit">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="hidden xl:block text-xl font-bold">CTN</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            {/* Main Navigation Sections */}
            <div className="space-y-2 mb-6">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
              </div>
              {mainNavigation.filter(item => item.show).map((item) => (
                <Link
                  key={item.name}
                  href={item.enabled ? item.href : '#'}
                  className={`flex items-center gap-4 px-3 py-3 rounded-full text-xl transition-colors group ${
                    item.enabled 
                      ? 'hover:bg-gray-900 text-white' 
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (!item.enabled) {
                      e.preventDefault()
                    }
                  }}
                  title={item.enabled ? item.description : `${item.name} - Requires college email verification`}
                >
                  <item.icon className={`w-7 h-7 ${item.enabled ? '' : 'opacity-50'}`} />
                  <span className={`hidden xl:block font-normal ${item.enabled ? '' : 'opacity-50'}`}>
                    {item.name}
                  </span>
                  {!item.enabled && (
                    <div className="hidden xl:block ml-auto">
                      <div className="w-2 h-2 bg-gray-600 rounded-full opacity-50"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Additional Navigation */}
            {additionalNavigation.some(item => item.show) && (
              <div className="space-y-2">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h3>
                </div>
                {additionalNavigation.filter(item => item.show).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-4 px-3 py-3 rounded-full text-xl hover:bg-gray-900 transition-colors group"
                  >
                    <item.icon className="w-7 h-7" />
                    <span className="hidden xl:block font-normal">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Post Button */}
            {user && (
              <button className="w-full xl:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full mt-6 transition-colors">
                <span className="hidden xl:block">Post</span>
                <span className="xl:hidden">+</span>
              </button>
            )}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="mt-auto">
              <div className="relative group">
                <button className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-900 transition-colors w-full">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden xl:block text-left flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{user.displayName || user.username}</p>
                    <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-500 hidden xl:block" />
                </button>

                {/* Dropdown */}
                <div className="absolute bottom-full left-0 mb-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-black border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                      <p className="font-bold text-white">@{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary-900/30 text-primary-400 rounded-lg">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-900 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="text-white">Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-900 transition-colors text-red-400"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Log out @{user.username}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64 xl:ml-80">
          <div className="flex">
            {/* Center Column - Main Feed */}
            <main className="flex-1 max-w-2xl border-x border-gray-800 min-h-screen">
              {/* Mobile Header */}
              <div className="lg:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-full hover:bg-gray-900 transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </Link>

                  {user ? (
                    <Link href="/profile" className="p-2 rounded-full hover:bg-gray-900 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <Link href="/auth/login" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-full text-sm">
                      Sign In
                    </Link>
                  )}
                </div>
              </div>

              {children}
            </main>

            {/* Right Sidebar - Trends/Suggestions */}
            <aside className="hidden xl:block w-80 p-4">
              <div className="sticky top-4 space-y-4">
                {/* Search */}
                <div className="bg-gray-900 rounded-2xl p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search Critical Thinking Network"
                      className="w-full bg-transparent pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const query = (e.target as HTMLInputElement).value
                          if (query.trim()) {
                            router.push(`/search?q=${encodeURIComponent(query)}`)
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Trending Section */}
                <TrendingSection />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="w-80 h-full bg-black border-r border-gray-800 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">CTN</span>
                  </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-4">
              {/* Main Navigation Sections */}
              <div>
                <div className="px-3 py-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
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
                      className={`flex items-center gap-4 px-3 py-3 rounded-full text-xl transition-colors ${
                        item.enabled 
                          ? 'hover:bg-gray-900 text-white' 
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <item.icon className={`w-7 h-7 ${item.enabled ? '' : 'opacity-50'}`} />
                      <span className={item.enabled ? '' : 'opacity-50'}>{item.name}</span>
                      {!item.enabled && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-gray-600 rounded-full opacity-50"></div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Additional Navigation */}
              {additionalNavigation.some(item => item.show) && (
                <div>
                  <div className="px-3 py-2 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h3>
                  </div>
                  <div className="space-y-2">
                    {additionalNavigation.filter(item => item.show).map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-3 py-3 rounded-full text-xl hover:bg-gray-900 transition-colors"
                      >
                        <item.icon className="w-7 h-7" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {user && (
              <div className="mt-8 pt-8 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">{user.displayName || user.username}</p>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-900 transition-colors text-red-400"
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
