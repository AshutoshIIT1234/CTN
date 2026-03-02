'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import { useAuthStore } from '@/store/authStore'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'
import { MessageSquare, ArrowLeft, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const dynamic = 'force-dynamic'

function MessagesContent() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    searchParams.get('userId')
  )
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  /* ── Mobile: show either list OR chat (not both) ── */
  const showList = !isMobile || !selectedUserId
  const showChat = !isMobile || !!selectedUserId

  return (
    <InstagramLayout>
      <div
        className="flex flex-col md:flex-row bg-white dark:bg-dark-900"
        style={{
          /* Use dynamic viewport height for accurate mobile full-screen */
          height: isMobile
            ? 'calc(100dvh - 56px - 60px - env(safe-area-inset-bottom, 0px))'
            : 'calc(100vh - 32px)',
          minHeight: 0,
        }}
      >

        {/* ══════════════════════════════════════
            CONVERSATION LIST PANEL
        ══════════════════════════════════════ */}
        <AnimatePresence initial={false}>
          {showList && (
            <motion.div
              key="conv-list"
              initial={isMobile ? { x: '-100%', opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              exit={isMobile ? { x: '-100%', opacity: 0 } : undefined}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="flex flex-col bg-white dark:bg-dark-900 border-r border-slate-100 dark:border-dark-800 flex-shrink-0"
              style={{
                width: isMobile ? '100%' : 340,
                minHeight: 0,
              }}
            >
              {/* List header */}
              <div
                className="flex items-center justify-between px-4 flex-shrink-0"
                style={{
                  height: 56,
                  borderBottom: '1px solid rgba(226,232,240,0.6)',
                  background: 'rgba(255,255,255,0.96)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-[16px] font-black text-slate-900 dark:text-white tracking-tight">
                    Messages
                  </h1>
                </div>

                <button
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-dark-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Search conversations"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Conversation list (scrollable) */}
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  minHeight: 0,
                }}
              >
                <ConversationList
                  selectedUserId={selectedUserId}
                  onSelectConversation={(id) => {
                    setSelectedUserId(id)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            CHAT WINDOW PANEL
        ══════════════════════════════════════ */}
        <AnimatePresence initial={false}>
          {showChat && (
            <motion.div
              key="chat-window"
              initial={isMobile && selectedUserId ? { x: '100%', opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              exit={isMobile ? { x: '100%', opacity: 0 } : undefined}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="flex-1 flex flex-col bg-slate-50/30 dark:bg-dark-950/20 relative overflow-hidden"
              style={{ minWidth: 0, minHeight: 0 }}
            >
              {selectedUserId ? (
                <ChatWindow
                  otherUserId={selectedUserId}
                  onBack={() => setSelectedUserId(null)}
                />
              ) : (
                /* ── Empty / Select-a-chat state (desktop) ── */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="relative mb-6"
                  >
                    <div
                      className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20 relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}
                    >
                      {/* Shimmer */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2.5s infinite',
                        }}
                      />
                      <MessageSquare className="w-10 h-10 text-white relative z-10" />
                    </div>

                    {/* Pulse ring */}
                    <span
                      className="absolute inset-0 rounded-[32px] opacity-30"
                      style={{
                        boxShadow: '0 0 0 8px rgba(99,102,241,0.3)',
                        animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                      }}
                    />
                  </motion.div>

                  <h3 className="text-[20px] font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Your Messages
                  </h3>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium max-w-[200px] leading-relaxed">
                    Select a conversation to start chatting
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </InstagramLayout>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}
