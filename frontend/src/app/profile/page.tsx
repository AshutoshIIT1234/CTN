'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    // Redirect to the user's own profile
    if (user) {
      router.push(`/profile/${user.id}`)
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null // Will redirect
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </MainLayout>
  )
}