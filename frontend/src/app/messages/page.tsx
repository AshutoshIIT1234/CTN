'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore } from '@/store/authStore'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'
import { MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

function MessagesContent() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    searchParams.get('userId')
  )

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <InstagramLayout showRightPanel={false}>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${selectedUserId ? 'hidden md:block' : 'block'} w-full md:w-96 border-r border-gray-200 flex flex-col`}>
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-royal-500 to-primary-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                Messages
              </h1>
            </div>
            <ConversationList
              selectedUserId={selectedUserId}
              onSelectConversation={setSelectedUserId}
            />
          </div>

          {/* Chat Window */}
          <div className={`${selectedUserId ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
            {selectedUserId ? (
              <ChatWindow
                otherUserId={selectedUserId}
                onBack={() => setSelectedUserId(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-royal-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your Messages
                  </h3>
                  <p className="text-gray-600">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstagramLayout>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
