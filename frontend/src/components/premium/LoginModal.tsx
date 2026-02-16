'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function LoginModal({ isOpen, onClose, message }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card max-w-md w-full p-8 relative animate-pulse-glow"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-navy-300" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-royal-500 to-primary-500 rounded-full blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-r from-royal-500 to-primary-500 p-4 rounded-full">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold text-navy-50 mb-3">
                  Join the Intellectual Network
                </h2>
                <p className="text-navy-300 leading-relaxed">
                  {message || 'Create an account to participate in discussions and access structured academic resources.'}
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center gap-2 w-full btn-primary"
                >
                  <Mail className="w-5 h-5" />
                  Continue with Email
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full btn-secondary"
                >
                  Already have an account? Login
                </Link>
              </div>

              {/* Footer Note */}
              <p className="text-center text-sm text-navy-400 mt-6">
                🎓 Verified college emails unlock private campus spaces
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
