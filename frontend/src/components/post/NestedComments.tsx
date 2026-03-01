'use client'

import { useState, useEffect } from 'react'
import { Heart, Reply } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  authorUsername: string
  authorName: string
  authorId: string
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
  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`)
      setComments(response.data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  useEffect(() => {
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
      const response = await api.post(`/posts/${postId}/comments`, {
        content: replyText.trim(),
        parentCommentId: commentId
      })

      const updateComments = (prevComments: Comment[]): Comment[] => {
        return prevComments.map(comment => {
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
        setLiked(liked)
        setLikeCount(comment.likes)
        console.error('Failed to like comment:', error)
      }
    }

    return (
      <div className={`${depth > 0 ? 'ml-12 mt-4' : 'mt-6'}`}>
        <div className="flex gap-4">
          <Link href={`/profile/${comment.authorId}`} className="relative group/avatar shrink-0">
            <div className="w-10 h-10 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-700 shadow-sm transition-all group-hover/avatar:scale-110">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-dark-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs uppercase">
                {comment.authorUsername[0]}
              </div>
            </div>
          </Link>

          <div className="flex-1 space-y-2">
            <div className="bg-slate-50 dark:bg-dark-950/40 p-5 rounded-[24px] border border-slate-100 dark:border-dark-800 transition-all hover:bg-white dark:hover:bg-dark-900 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[13px] text-slate-900 dark:text-white tracking-tight">{comment.authorName || comment.authorUsername}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Signal • {formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                </div>
                <button
                  onClick={handleLikeComment}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${liked ? 'bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                  <span className="text-[11px] font-black">{likeCount}</span>
                </button>
              </div>
              <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{comment.content}</p>
            </div>

            <div className="flex items-center gap-4 px-2">
              <button
                onClick={() => {
                  if (!user) {
                    onLoginRequired?.()
                    return
                  }
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Contribute
              </button>

              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {showReplies ? 'Hide' : 'Expand'} {comment.replies.length} Signals
                </button>
              )}
            </div>

            <AnimatePresence>
              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="mt-4 flex gap-3 p-4 bg-white dark:bg-dark-900 rounded-[24px] border border-blue-500/20 shadow-xl shadow-blue-500/5"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Transmit thought..."
                    className="flex-1 text-sm px-6 py-3 bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-blue-500/30 rounded-xl focus:outline-none transition-all text-slate-900 dark:text-white font-bold"
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
                    disabled={loading || !replyText.trim()}
                    className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30"
                  >
                    Post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {showReplies && comment.replies && comment.replies.length > 0 && (
              <div className="pt-2">
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
    <div className="border-t border-slate-50 dark:border-dark-800 px-2 py-10">
      {user && (
        <div className="flex gap-4 mb-10 bg-slate-50/50 dark:bg-dark-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-dark-800">
          <div className="w-10 h-10 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-dark-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs uppercase">
              {user.username[0]}
            </div>
          </div>
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute to the discourse..."
              className="flex-1 text-[15px] px-6 py-4 bg-white dark:bg-dark-800 border-2 border-transparent focus:border-blue-500/30 rounded-2xl focus:outline-none transition-all text-slate-900 dark:text-white font-bold"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200/20 disabled:opacity-30"
            >
              Post
            </button>
          </div>
        </div>
      )}

      <div>
        {comments.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-4xl mb-6 grayscale opacity-20">💭</div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">No Active Discussion</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Be the primary node to initiate this thread</p>
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
