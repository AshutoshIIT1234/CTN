'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface ChatWindowProps {
  otherUserId: string
  onBack: () => void
}

export function ChatWindow({ otherUserId, onBack }: ChatWindowProps) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch other user's profile
  const { data: otherUser } = useQuery({
    queryKey: ['user-profile', otherUserId],
    queryFn: async () => {
      const response = await api.get(`/users/${otherUserId}/profile`)
      return response.data
    },
  })

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', otherUserId],
    queryFn: async () => {
      const response = await api.get(`/messages/conversation/${otherUserId}`)
      return response.data
    },
    refetchInterval: 3000,
  })

  // Mark messages as read
  useEffect(() => {
    if (otherUserId) {
      api.post(`/messages/read/${otherUserId}`)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  }, [otherUserId, queryClient])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesData])

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('/messages', {
        receiverId: otherUserId,
        content,
      })
      return response.data
    },
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['messages', otherUserId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim())
    }
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-dark-900">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-50 dark:border-dark-800 flex items-center justify-between bg-white dark:bg-dark-900 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="md:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>

          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => router.push(`/profile/${otherUser.id}`)}
          >
            {otherUser.profilePictureUrl ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/10">
                <img
                  src={otherUser.profilePictureUrl}
                  alt={otherUser.username}
                  className="w-full h-full rounded-[14px] object-cover border-2 border-white dark:border-dark-900"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-dark-900">
                <span className="text-white font-black text-lg">
                  {otherUser.username[0].toUpperCase()}
                </span>
              </div>
            )}

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {otherUser.displayName || otherUser.username}
              </h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">@{otherUser.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-dark-950/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : messagesData?.messages && messagesData.messages.length > 0 ? (
          <>
            {messagesData.messages.map((msg: any) => {
              const isOwn = msg.senderId._id === user?.id
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] space-y-1.5 ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-5 py-3 rounded-[24px] shadow-sm ${isOwn
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 text-slate-900 dark:text-white rounded-tl-none'
                        }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-800 rounded-3xl flex items-center justify-center opacity-50">
              <span className="text-3xl">📭</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Transmission Empty</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Initiate data transfer below</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-50 dark:border-dark-800 bg-white dark:bg-dark-900">
        <form onSubmit={handleSend} className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Transmit signal..."
              className="w-full px-6 py-4 bg-slate-50 dark:bg-dark-800 border-2 border-transparent focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 rounded-2xl focus:outline-none transition-all text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20 disabled:shadow-none flex-shrink-0"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
