'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Mail, 
  ArrowLeft,
  Settings,
  Edit,
  Search
} from 'lucide-react'

export default function MessagesPage() {
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
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-gray-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-900 transition-colors">
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-gray-800 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search Direct Messages"
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen">
        <div className="text-center py-16">
          <Mail className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Welcome to your inbox!
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Drop a line, share posts and more with private conversations between you and others on Critical Thinking Network.
          </p>
          <button
            onClick={() => router.push('/search')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Start a conversation
          </button>
        </div>
      </div>
    </MainLayout>
  )
}