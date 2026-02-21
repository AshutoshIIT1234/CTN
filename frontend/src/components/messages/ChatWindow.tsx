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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-royal-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push(`/profile/${otherUser.id}`)}
        >
          {otherUser.profilePictureUrl ? (
            <img
              src={otherUser.profilePictureUrl}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
              <span className="text-white font-semibold">
                {otherUser.username[0].toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-gray-900">
              {otherUser.displayName || otherUser.username}
            </h2>
            <p className="text-sm text-gray-500">@{otherUser.username}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-royal-600 animate-spin" />
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
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${isOwn
                          ? 'bg-gradient-to-r from-royal-600 to-primary-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="p-3 bg-gradient-to-r from-royal-600 to-primary-600 text-white rounded-xl hover:from-royal-700 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
