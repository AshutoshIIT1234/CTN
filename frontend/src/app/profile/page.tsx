'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'

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
    <InstagramLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-royal-600 border-t-transparent"></div>
      </div>
    </InstagramLayout>
  )
}