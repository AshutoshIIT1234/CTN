'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Heart, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface CommentSectionProps {
  postId: string
  onUpdate: () => void
}

export function CommentSection({ postId, onUpdate }: CommentSectionProps) {
  const { user } = useAuthStore()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: comments, refetch } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/comments`)
      return response.data
    },
  })

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user || isSubmitting) return

    setIsSubmitting(true)
    try {
      await api.post(`/posts/${postId}/comments`, { content: newComment })
      setNewComment('')
      refetch()
      onUpdate()
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) return

    try {
      await api.post(`/posts/comments/${commentId}/like`)
      refetch()
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      {user && (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user.username[0].toUpperCase()}
            </span>
          </div>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-royal-500 transition-all"
              disabled={isSubmitting}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-royal-600 hover:bg-royal-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment: any, index: number) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {comment.authorUsername[0].toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-500">
                    @{comment.authorUsername}
                  </span>
                </div>
                <p className="text-gray-900 text-sm">
                  {comment.content}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-2 px-2">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  disabled={!user}
                  className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart
                    className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`}
                  />
                  <span>{comment.likes}</span>
                </button>

                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {comments?.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}
