'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
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
    <MainLayout>
      {/* Header - X.com style */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-0">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-900 transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Bookmarks</h1>
                <p className="text-sm text-gray-500">@{user?.username}</p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-900 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen">
        <div className="text-center py-16">
          <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Save posts for later
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Bookmark posts to easily find them again. Only you can see your bookmarks.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Find posts to bookmark
          </button>
        </div>
      </div>
    </MainLayout>
  )
}