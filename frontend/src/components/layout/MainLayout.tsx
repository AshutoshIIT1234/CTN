'use client'

import { ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  TrendingUp,
  Activity,
  Zap,
  Lock
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950">
      {/* Desktop: Flexible wide layout */}
      <div className="hidden lg:grid lg:grid-cols-[280px_1fr_360px] lg:gap-8 lg:max-w-[1700px] lg:mx-auto px-6">
        {/* Left Sidebar */}
        <div className="sticky top-0 h-screen py-8 z-[50]">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="min-h-screen bg-white dark:bg-dark-900 border-x border-slate-100 dark:border-dark-800 shadow-sm relative z-10 transition-all duration-500">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="sticky top-0 h-screen py-8">
          <RightPanel />
        </div>
      </div>

      {/* Tablet: Two-column layout */}
      <div className="hidden md:grid lg:hidden md:grid-cols-[100px_1fr] md:gap-6 md:max-w-[1000px] md:mx-auto">
        <div className="w-[100px] px-3 py-6 fixed h-full bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 z-[50]">
          <div className="flex flex-col items-center gap-6">
            <Link href="/" className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </Link>
            {mainNavigation.filter(item => item.show && item.enabled).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                title={item.name}
              >
                <item.icon className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <main className="ml-[100px] min-h-screen bg-white dark:bg-dark-900 border-x border-slate-200 dark:border-dark-800">
          {children}
        </main>
      </div>

      {/* Mobile: Single column with bottom nav */}
      <div className="md:hidden">
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-dark-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5">
            <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
          <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </Link>
          {user ? (
            <Link href="/profile" className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold">
              {user.username[0].toUpperCase()}
            </Link>
          ) : (
            <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">Join</Link>
          )}
        </div>

        <main className="min-h-screen pb-24 bg-white dark:bg-dark-900">
          {children}
        </main>

        <MobileBottomNav />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 h-full bg-white dark:bg-dark-900 p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">CTN</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="w-6 h-6 text-slate-900 dark:text-white" />
                </button>
              </div>

              <nav className="space-y-2">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.enabled ? item.href : '#'}
                    onClick={() => item.enabled && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-5 px-6 py-4 rounded-[24px] transition-all ${item.enabled ? 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white' : 'opacity-40 grayscale'
                      }`}
                  >
                    <item.icon className="w-6 h-6 text-slate-400" />
                    <span className="font-bold text-lg leading-none">{item.name}</span>
                    {!item.enabled && <Lock className="w-4 h-4 ml-auto text-slate-300" />}
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="absolute bottom-8 left-8 right-8 pt-8 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4 mb-8 px-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-black text-xl">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white tracking-tight">{user.displayName || user.username}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">@{user.username}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-[24px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-black text-[11px] uppercase tracking-widest transition-all">
                    <LogOut className="w-5 h-5" />
                    Deauthorize
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
