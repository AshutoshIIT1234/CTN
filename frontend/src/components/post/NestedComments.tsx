'use client'

import { useState, useEffect } from 'react'
import { Heart, Reply } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface Comment {
  id: string
  content: string
  authorUsername: string
  authorName: string
  createdAt: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface NestedCommentsProps {
  postId: string
  onLoginRequired?: () => void
}

export function NestedComments({ postId, onLoginRequired }: NestedCommentsProps) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/posts/${postId}/comments`)
        setComments(response.data)
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      }
    }
    fetchComments()
  }, [postId])

  const handleAddComment = async () => {
    if (!user) {
      onLoginRequired?.()
      return
    }
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: newComment.trim()
      })
      setComments([response.data, ...comments])
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (commentId: string) => {
    if (!user) {
      onLoginRequired?.()
      return
    }
    if (!replyText.trim()) return

    setLoading(true)
    try {
      const response = await api.post(`/posts/${postId}/comments/${commentId}/reply`, {
        content: replyText.trim()
      })
      
      // Update comments with new reply
      const updateComments = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data]
            }
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComments(comment.replies)
            }
          }
          return comment
        })
      }
      
      setComments(updateComments(comments))
      setReplyText('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to add reply:', error)
    } finally {
      setLoading(false)
    }
  }

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const [showReplies, setShowReplies] = useState(true)
    const [liked, setLiked] = useState(comment.isLiked)
    const [likeCount, setLikeCount] = useState(comment.likes)

    const handleLikeComment = async () => {
      if (!user) {
        onLoginRequired?.()
        return
      }
      
      // Optimistic update
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
      
      try {
        await api.post(`/posts/${postId}/comments/${comment.id}/like`)
      } catch (error) {
        // Revert on error
        setLiked(liked)
        setLikeCount(comment.likes)
        console.error('Failed to like comment:', error)
      }
    }

    return (
      <div className={`${depth > 0 ? 'ml-12 mt-3' : 'mt-4'}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {comment.authorUsername[0].toUpperCase()}
            </span>
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  {comment.authorUsername}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-900">{comment.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-1 px-2">
              <button
                onClick={handleLikeComment}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-500 transition-colors"
              >
                <Heart className={`w-3 h-3 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    onLoginRequired?.()
                    return
                  }
                  setReplyingTo(comment.id)
                }}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-royal-600 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>

              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>

            {/* Reply Input */}
            <AnimatePresence>
              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 text-sm px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-royal-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleReply(comment.id)
                      }
                    }}
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-royal-600 text-white text-sm font-semibold rounded-full hover:bg-royal-700 transition-colors disabled:opacity-50"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nested Replies */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 px-4 py-4">
      {/* Add Comment */}
      {user && (
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-royal-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={loading}
              className="px-4 py-2 bg-royal-600 text-white text-sm font-semibold rounded-full hover:bg-royal-700 transition-colors disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {!user && (
        <button
          onClick={onLoginRequired}
          className="w-full text-sm text-gray-500 hover:text-gray-700 py-3 text-center"
        >
          Login to comment...
        </button>
      )}

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  )
}
