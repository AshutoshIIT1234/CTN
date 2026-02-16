'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Lock, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export function PremiumNavbar() {
  const { user } = useAuthStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'National', href: '/', icon: null },
    { name: 'Resources', href: '/resources', icon: user ? null : Lock, locked: !user },
    { name: 'Colleges', href: '/college', icon: null },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-royal-500 to-primary-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-royal-500 to-primary-500 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              CTN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-primary-400'
                    : 'text-navy-300 hover:text-navy-50'
                }`}
              >
                {item.name}
                {item.locked && <Lock className="w-4 h-4" />}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 glass-card px-4 py-2 rounded-full hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-navy-50 font-medium">{user.username}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-ghost"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-navy-50" />
            ) : (
              <Menu className="w-6 h-6 text-navy-50" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-navy-900/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-navy-300 hover:bg-white/5 hover:text-navy-50'
                  }`}
                >
                  {item.name}
                  {item.locked && <Lock className="w-4 h-4" />}
                </Link>
              ))}

              <div className="pt-4 border-t border-white/10 space-y-3">
                {user ? (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-navy-50 font-medium">{user.username}</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-lg text-navy-300 hover:bg-white/5 hover:text-navy-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center btn-primary"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
