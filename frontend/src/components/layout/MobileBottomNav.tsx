'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const navItems = [
    { icon: Home, label: 'Home', href: '/', requiresAuth: false },
    { icon: Search, label: 'Explore', href: '/search', requiresAuth: false },
    { icon: PlusSquare, label: 'Create', href: '/create-post', requiresAuth: true },
    { icon: Bell, label: 'Notifications', href: '/notifications', requiresAuth: true },
    { icon: User, label: 'Profile', href: user ? `/profile/${user.id}` : '/auth/login', requiresAuth: false },
  ]

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50"
      style={{ 
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isLocked = item.requiresAuth && !user

          return (
            <Link
              key={item.href}
              href={isLocked ? '/auth/login' : item.href}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200"
              style={{
                minWidth: '44px',
                minHeight: '44px'
              }}
            >
              <Icon 
                className="w-6 h-6"
                style={{
                  color: isActive ? '#3B82F6' : '#6B7280',
                  strokeWidth: isActive ? 2.5 : 2
                }}
              />
              <span 
                className="text-xs mt-0.5"
                style={{
                  color: isActive ? '#3B82F6' : '#6B7280',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
