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
      <div className="bg-white dark:bg-dark-900 border border-slate-50 dark:border-dark-800 rounded-[32px] shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden mt-6 mx-4" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`${selectedUserId ? 'hidden md:block' : 'block'} w-full md:w-96 border-r border-slate-50 dark:border-dark-800 flex flex-col bg-slate-50/10 dark:bg-dark-900/10`}>
            <div className="p-8 border-b border-slate-50 dark:border-dark-800">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tighter">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                Nodes
              </h1>
            </div>
            <ConversationList
              selectedUserId={selectedUserId}
              onSelectConversation={setSelectedUserId}
            />
          </div>

          {/* Chat Window */}
          <div className={`${selectedUserId ? 'block' : 'hidden md:block'} flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-dark-900`}>
            {selectedUserId ? (
              <ChatWindow
                otherUserId={selectedUserId}
                onBack={() => setSelectedUserId(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center bg-slate-50/30 dark:bg-dark-950/20">
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <MessageSquare className="w-10 h-10 text-white relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Signal Interface
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xs mx-auto">
                      Select a peer to initialize an encrypted signal thread.
                    </p>
                  </div>
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
