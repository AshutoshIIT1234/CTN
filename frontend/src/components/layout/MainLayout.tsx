'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  BookOpen,
  Search,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  X,
  Lock,
  Mail,
  Bookmark,
  User,
  TrendingUp,
  Home,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { MobileBottomNav } from './MobileBottomNav'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import Link from 'next/link'

interface MainLayoutProps {
  children: ReactNode
  showMobileHeader?: boolean
}

export function MainLayout({ children, showMobileHeader = true }: MainLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  /* Close drawer on route change */
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (user?.role === UserRole.ADMIN && !pathname.startsWith('/admin')) {
      router.replace('/admin')
    } else if (user?.role === UserRole.MODERATOR && !pathname.startsWith('/moderator')) {
      router.replace('/moderator')
    }
  }, [user, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const navigation = [
    {
      name: 'National',
      href: '/',
      icon: Home,
      show: true,
      enabled: true,
      description: 'National discussion panel',
    },
    {
      name: 'College',
      href: '/college',
      icon: Users,
      show: true,
      enabled:
        user?.role === UserRole.COLLEGE_USER ||
        user?.role === UserRole.MODERATOR ||
        user?.role === UserRole.ADMIN,
      description: 'Private college discussion space',
    },
    {
      name: 'Resources',
      href: '/resources',
      icon: BookOpen,
      show: true,
      enabled:
        user?.role === UserRole.COLLEGE_USER ||
        user?.role === UserRole.MODERATOR ||
        user?.role === UserRole.ADMIN,
      description: 'Academic resource repository',
    },
    {
      name: 'Explore',
      href: '/search',
      icon: Search,
      show: true,
      enabled: true,
      description: 'Search and discover content',
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: Mail,
      show: !!user,
      enabled: !!user,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      show: !!user,
      enabled: !!user,
    },
    {
      name: 'Trending',
      href: '/trending',
      icon: TrendingUp,
      show: true,
      enabled: true,
      description: 'Trending topics',
    },
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: Bookmark,
      show: !!user,
      enabled: !!user,
    },
    {
      name: 'Profile',
      href: user ? `/profile/${user.id}` : '/profile',
      icon: User,
      show: !!user,
      enabled: !!user,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      show: !!user,
      enabled: !!user,
    },
  ]

  const isNavActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  /* ─── Desktop (≥1024px): Three-column ─────────────────────── */
  /* ─── Tablet  (768-1023px): Slim icon sidebar ──────────────── */
  /* ─── Mobile  (<768px): Full-screen with bottom nav ─────────── */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950">

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT  (lg+)
      ══════════════════════════════════════════ */}
      {(() => {
        const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/moderator')
        return (
          <div className={`hidden lg:grid lg:gap-6 lg:max-w-[1600px] lg:mx-auto lg:px-4 xl:px-6 lg:items-start ${isAdminRoute ? 'lg:grid-cols-[280px_1fr]' : 'lg:grid-cols-[280px_1fr_340px]'}`}>
            {/* Left Sidebar — sticky scroll alongside page content */}
            <div className="sticky top-0 h-screen py-6 z-50 overflow-y-auto hide-scrollbar">
              <Sidebar />
            </div>

            {/* Main Content — natural height, page body scrolls */}
            <main className={`bg-white dark:bg-dark-900 shadow-sm relative z-10 ${isAdminRoute ? 'border-l border-slate-100 dark:border-dark-800' : 'border-x border-slate-100 dark:border-dark-800'}`} style={{ minHeight: '100vh' }}>
              {children}
            </main>

            {/* Right Panel — hidden on admin/moderator routes */}
            {!isAdminRoute && (
              <div className="sticky top-0 h-screen py-6 overflow-y-auto hide-scrollbar">
                <RightPanel />
              </div>
            )}
          </div>
        )
      })()}

      {/* ══════════════════════════════════════════
          TABLET LAYOUT  (md – lg)
      ══════════════════════════════════════════ */}
      <div className="hidden md:flex lg:hidden" style={{ minHeight: '100vh' }}>
        {/* Icon-only sidebar */}
        <aside
          className="fixed top-0 left-0 h-full z-50 flex flex-col items-center gap-5 py-6 px-3"
          style={{
            width: 72,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(226,232,240,0.6)',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </Link>

          {/* Nav Icons */}
          {navigation
            .filter((item) => item.show && item.enabled)
            .map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
                      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-500'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {/* Tooltip */}
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg z-50">
                    {item.name}
                  </span>
                </Link>
              )
            })}
        </aside>

        {/* Main Content offset by sidebar */}
        <main
          className="flex-1 min-h-screen bg-white dark:bg-dark-900"
          style={{ marginLeft: 72 }}
        >
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (< md)
      ══════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col" style={{ minHeight: '100dvh' }}>

        {showMobileHeader && (
          <header
            className="sticky top-0 z-40 flex items-center justify-between px-4"
            style={{
              height: 56,
              paddingTop: 'env(safe-area-inset-top, 0px)',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderBottom: '1px solid rgba(226,232,240,0.5)',
              boxShadow: '0 1px 12px rgba(15,23,42,0.06)',
            }}
          >
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <Link
              href="/"
              className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20"
                style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-tighter text-slate-900 dark:text-white">
                CTN
              </span>
            </Link>

            {user ? (
              <Link
                href={`/profile/${user.id}`}
                className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                aria-label="Profile"
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-sm font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="h-8 px-3 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center"
                >
                  Sign In
              </Link>
            )}
          </header>
        )}

        {/* ── Page Content ──────────────────────── */}
        <main className="flex-1 bg-white dark:bg-dark-900 pb-nav">
          {children}
        </main>

        {/* ── Bottom Nav ────────────────────────── */}
        <MobileBottomNav />
      </div>

      {/* ══════════════════════════════════════════
          MOBILE SIDE DRAWER
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-[100] w-[300px] flex flex-col bg-white dark:bg-dark-900 shadow-2xl overflow-hidden"
              style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-800">
                <Link
                  href="/"
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                    style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none block">
                      CTN
                    </span>
                    <span className="text-[10px] font-semibold text-blue-500 tracking-widest">
                      Critical Thinking Network
                    </span>
                  </div>
                </Link>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.button>
              </div>

              {/* User card inside drawer */}
              {user && (
                <div className="px-4 py-3 border-b border-slate-50 dark:border-dark-800">
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-dark-800 active:opacity-70 transition-opacity"
                  >
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-black text-white shadow"
                      style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                    >
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.username[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 truncate">
                          @{user.username}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  </Link>
                </div>
              )}

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {navigation
                  .filter((item) => item.show)
                  .map((item) => {
                    const active = isNavActive(item.href)
                    const locked = !item.enabled

                    return (
                      <Link
                        key={item.name}
                        href={locked ? '#' : item.href}
                        onClick={() => {
                          if (!locked) setIsMobileMenuOpen(false)
                        }}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 relative
                          ${active
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : locked
                              ? 'text-slate-300 dark:text-slate-600'
                              : 'text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-white/5'
                          }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        {/* Active bar */}
                        {active && (
                          <motion.span
                            layoutId="drawerActiveBar"
                            className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                          />
                        )}

                        <item.icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            active
                              ? 'text-blue-600 dark:text-blue-400'
                              : locked
                                ? 'text-slate-300 dark:text-slate-600'
                                : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />

                        <span className="text-sm font-semibold leading-none flex-1">
                          {item.name}
                        </span>

                        {locked && (
                          <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-auto" />
                        )}
                      </Link>
                    )
                  })}
              </nav>

              {/* Drawer Footer — Logout */}
              {user ? (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-dark-800 pt-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-semibold text-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              ) : (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-dark-800 pt-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
