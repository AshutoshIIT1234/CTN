'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function LoginModal({ isOpen, onClose, message = 'Please log in to continue' }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 max-w-md w-full relative"
              style={{ 
                border: '1px solid #E5E7EB',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#6B7280' }} />
              </button>

              {/* Content */}
              <div className="text-center pt-4">
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
                >
                  <span className="text-3xl">🔒</span>
                </div>

                {/* Title */}
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: '#111827' }}
                >
                  Login Required
                </h2>

                {/* Message */}
                <p 
                  className="text-base mb-6"
                  style={{ color: '#6B7280' }}
                >
                  {message}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200"
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      color: '#111827'
                    }}
                  >
                    Sign Up
                  </Link>
                </div>

                {/* Footer */}
                <button
                  onClick={onClose}
                  className="mt-4 text-sm transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  Continue as guest
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
