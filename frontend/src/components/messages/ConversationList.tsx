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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl animate-pulse bg-white/50 dark:bg-dark-800/50">
            <div className="w-14 h-14 bg-slate-100 dark:bg-dark-700 rounded-2xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-100 dark:bg-dark-700 rounded-lg w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-100 dark:bg-dark-700 rounded-lg w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 dark:bg-dark-800 rounded-2xl flex items-center justify-center">
          <p className="text-2xl">📡</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">No Active Nodes</p>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Initialize frequency from a peer profile</p>
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
            className={`w-full flex items-center gap-4 p-5 transition-all relative group border-b border-slate-50/50 dark:border-dark-800/50 ${isSelected
                ? 'bg-blue-50/50 dark:bg-blue-500/5'
                : 'hover:bg-slate-50 dark:hover:bg-dark-800/50'
              }`}
          >
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
            )}
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              {otherUser.profilePictureUrl ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-dark-700 dark:to-dark-600 shadow-sm">
                  <img
                    src={otherUser.profilePictureUrl}
                    alt={otherUser.username}
                    className="w-full h-full rounded-[14px] object-cover border-2 border-white dark:border-dark-900"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-dark-900 shadow-blue-500/10">
                  <span className="text-white font-black text-xl">
                    {otherUser.username[0].toUpperCase()}
                  </span>
                </div>
              )}
              {hasUnread && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white dark:border-dark-900 shadow-sm animate-bounce">
                  {conversation.unreadCount}
                </div>
              )}
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className={`text-[15px] font-black tracking-tight truncate ${hasUnread || isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {otherUser.displayName || otherUser.username}
                </h3>
                {conversation.lastMessageAt && (
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className={`text-sm truncate leading-tight ${hasUnread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {conversation.lastMessageContent || 'Awaiting transmission...'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
