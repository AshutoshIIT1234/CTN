'use client'

import { useState, useEffect } from 'react'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bookmark,
  ArrowLeft,
  MoreHorizontal,
  Trash2
} from 'lucide-react'

export default function BookmarksPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <InstagramLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-slate-50 dark:border-dark-800">
        <div className="px-6 py-0">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Saved Intellectual Assets</h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">@{user?.username}</p>
              </div>
            </div>
            <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors text-slate-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen px-6">
        <div className="text-center py-32 space-y-8">
          <div className="w-24 h-24 bg-slate-50 dark:bg-dark-800 rounded-[32px] flex items-center justify-center mx-auto relative overflow-hidden">
            <Bookmark className="w-10 h-10 text-slate-200 dark:text-slate-700" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Archive is Empty
            </h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
              Conserve critical intellectual property for future derivation. Only your node can access this repository.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            Saturate Archive
          </button>
        </div>
      </div>
    </InstagramLayout>
  )
}