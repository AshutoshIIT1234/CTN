'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  selectedUserId: string | null
  onSelectConversation: (userId: string) => void
}

export function ConversationList({ selectedUserId, onSelectConversation }: ConversationListProps) {
  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations')
      return response.data
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-gray-500 text-sm">No conversations yet</p>
          <p className="text-gray-400 text-xs mt-1">Start a conversation from a user's profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {conversations.map((conversation: any) => {
        const otherUser = conversation.otherUser
        const isSelected = selectedUserId === otherUser._id
        const hasUnread = conversation.unreadCount > 0

        return (
          <button
            key={conversation._id}
            onClick={() => onSelectConversation(otherUser._id)}
            className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-l-4 ${
              isSelected
                ? 'bg-royal-50 border-royal-600'
                : hasUnread
                ? 'border-royal-400'
                : 'border-transparent'
            }`}
          >
            {/* Profile Picture */}
            {otherUser.profilePictureUrl ? (
              <img
                src={otherUser.profilePictureUrl}
                alt={otherUser.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {otherUser.username[0].toUpperCase()}
                </span>
              </div>
            )}

            {/* Conversation Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {otherUser.displayName || otherUser.username}
                </h3>
                {conversation.lastMessageAt && (
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {conversation.lastMessageContent || 'No messages yet'}
                </p>
                {hasUnread && (
                  <span className="ml-2 px-2 py-0.5 bg-royal-600 text-white text-xs font-bold rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
