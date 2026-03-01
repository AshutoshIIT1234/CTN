'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, Bell, User, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const navItems = [
    { icon: Home, label: 'Feed', href: '/', requiresAuth: false },
    { icon: Search, label: 'Explore', href: '/search', requiresAuth: false },
    { icon: Sparkles, label: 'Create', href: '/create-post', requiresAuth: true, primary: true },
    { icon: Bell, label: 'Alerts', href: '/notifications', requiresAuth: true },
    { icon: User, label: 'Profile', href: user ? `/profile/${user.id}` : '/auth/login', requiresAuth: false },
  ]

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl rounded-[32px] border border-white/20 dark:border-dark-800 shadow-2xl shadow-indigo-200/40 p-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isLocked = item.requiresAuth && !user

          if (item.primary) {
            return (
              <motion.div
                key={item.href}
                whileTap={{ scale: 0.9 }}
                className="relative -mt-10"
              >
                <Link
                  href={isLocked ? '/auth/login' : item.href}
                  className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-300 transition-transform active:scale-95"
                >
                  <Icon className="w-7 h-7 text-white" />
                </Link>
              </motion.div>
            )
          }

          return (
            <Link
              key={item.href}
              href={isLocked ? '/auth/login' : item.href}
              className="relative flex flex-col items-center justify-center py-2 flex-1"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

