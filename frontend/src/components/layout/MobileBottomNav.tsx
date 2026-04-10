'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  Bell,
  User,
  PlusSquare,
  Building2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CreatePostModal } from '../post/CreatePostModal'
import { useQueryClient } from '@tanstack/react-query'

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      href: '/',
      requiresAuth: false,
      match: (p: string) => p === '/',
    },
    {
      icon: Search,
      label: 'Explore',
      href: '/search',
      requiresAuth: false,
      match: (p: string) => p.startsWith('/search'),
    },
    {
      icon: null, // center create button
      label: 'Create',
      href: null,
      requiresAuth: true,
      match: () => false,
      isCreate: true,
    },
    {
      icon: Bell,
      label: 'Alerts',
      href: '/notifications',
      requiresAuth: true,
      match: (p: string) => p.startsWith('/notifications'),
    },
    {
      icon: User,
      label: 'Profile',
      href: user ? `/profile/${user.id}` : '/auth/login',
      requiresAuth: false,
      match: (p: string) => p.startsWith('/profile'),
    },
  ]

  const handleCreateTap = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setShowCreateModal(true)
  }

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(226,232,240,0.6)',
          boxShadow: '0 -4px 24px rgba(15,23,42,0.06)',
        }}
      >
        {/* Dark mode background */}
        <div
          className="dark:block hidden absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(15,23,42,0.92)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        />

        <div className="relative flex items-center justify-around px-2 py-1" style={{ height: 60 }}>
          {navItems.map((item, index) => {
            /* ── Center Create Button ── */
            if (item.isCreate) {
              return (
                <div key="create" className="flex-1 flex items-center justify-center">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleCreateTap}
                    className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                    }}
                    aria-label="Create post"
                  >
                    <PlusSquare className="w-6 h-6 text-white" strokeWidth={2} />
                    {/* Glow ring */}
                    <span
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        boxShadow: '0 0 0 0px rgba(99,102,241,0.5)',
                        animation: 'none',
                      }}
                    />
                  </motion.button>
                </div>
              )
            }

            const Icon = item.icon!
            const isActive = item.match(pathname)
            const href = item.requiresAuth && !user ? '/auth/login' : (item.href ?? '/auth/login')

            return (
              <Link
                key={item.label}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 no-underline"
                style={{ minHeight: 44, touchAction: 'manipulation' }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className="relative flex items-center justify-center w-10 h-8 rounded-xl transition-colors duration-200"
                  style={{
                    backgroundColor: isActive
                      ? 'rgba(59,130,246,0.1)'
                      : 'transparent',
                  }}
                >
                  <Icon
                    className="transition-all duration-200"
                    style={{
                      width: 22,
                      height: 22,
                      strokeWidth: isActive ? 2.5 : 2,
                      color: isActive ? '#3B82F6' : '#94A3B8',
                    }}
                  />

                  {/* Notification dot for alerts */}
                  {item.label === 'Alerts' && user && (
                    <span
                      className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-900"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className="text-[10px] font-bold leading-none transition-colors duration-200 no-select"
                  style={{
                    color: isActive ? '#3B82F6' : '#94A3B8',
                    letterSpacing: '0.03em',
                  }}
                >
                  {item.label}
                </span>

                {/* Active dot indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"
                    />
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind the nav */}
      <div
        className="md:hidden"
        style={{
          height: `calc(60px + env(safe-area-inset-bottom, 0px))`,
        }}
        aria-hidden="true"
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={() => {
          setShowCreateModal(false)
          queryClient.invalidateQueries({ queryKey: ['national-feed'] })
          if (user?.collegeId) {
            queryClient.invalidateQueries({ queryKey: ['college-feed'] })
          }
        }}
      />
    </>
  )
}
