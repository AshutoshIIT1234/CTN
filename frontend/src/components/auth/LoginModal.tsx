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
              className="bg-white dark:bg-dark-900 rounded-3xl p-8 max-w-md w-full relative border border-slate-200 dark:border-dark-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Content */}
              <div className="text-center pt-4">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-[22px] mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
                >
                  <span className="text-3xl text-white">🔒</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black mb-2 text-[#1E293B] dark:text-white uppercase tracking-tight">
                  Login Required
                </h2>

                {/* Message */}
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                  {message}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-widest text-[#1E293B] dark:text-white bg-white dark:bg-dark-800 border-2 border-slate-100 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700 transition-all active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>

                {/* Footer */}
                <button
                  onClick={onClose}
                  className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
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
