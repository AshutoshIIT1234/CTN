'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { NestedComments } from './NestedComments'
import Link from 'next/link'

interface InstagramPostCardProps {
  post: any
  onUpdate: () => void
  onLoginRequired?: () => void
}

export function InstagramPostCard({ post, onUpdate, onLoginRequired }: InstagramPostCardProps) {
  const { user } = useAuthStore()
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)

  const handleLike = async () => {
    if (!user) {
      onLoginRequired?.()
      return
    }

    if (isLiking) return

    // Optimistic update
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)

    setIsLiking(true)
    try {
      await api.post(`/posts/${post.id}/like`)
      onUpdate()
    } catch (error) {
      // Revert on error
      setLiked(liked)
      setLikeCount(post.likes)
      console.error('Failed to like post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDoubleClick = () => {
    if (!user || liked) return
    setShowLikeAnimation(true)
    handleLike()
    setTimeout(() => setShowLikeAnimation(false), 1000)
  }

  const handleComment = () => {
    if (!user) {
      onLoginRequired?.()
      return
    }
    setShowComments(!showComments)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this discussion',
          text: post.content,
          url: window.location.origin + `/posts/${post.id}`
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <article 
      className="bg-white mb-4 rounded-lg transition-all duration-200 hover:-translate-y-0.5" 
      style={{ 
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Link href={`/profile/${post.authorId}`}>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity duration-200"
              style={{ 
                background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                border: '1px solid #E5E7EB'
              }}
            >
              <span className="text-white text-xs font-semibold">
                {post.authorUsername[0].toUpperCase()}
              </span>
            </div>
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <Link 
              href={`/profile/${post.authorId}`} 
              className="text-sm font-semibold hover:opacity-60 transition-opacity duration-200"
              style={{ color: '#111827' }}
            >
              {post.authorUsername}
            </Link>
            {post.panelType === 'COLLEGE' && (
              <span className="text-xs" style={{ color: '#6B7280' }}>
                • {post.collegeName || 'College'}
              </span>
            )}
          </div>
        </div>

        {/* More Options */}
        <button className="p-2 hover:opacity-60 transition-opacity duration-200">
          <MoreHorizontal className="w-6 h-6" style={{ color: '#111827' }} />
        </button>
      </div>

      {/* Content */}
      <div
        className="relative cursor-pointer select-none"
        onDoubleClick={handleDoubleClick}
      >
        {/* Post Images */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="relative bg-black">
            {post.imageUrls.length === 1 ? (
              <img
                src={post.imageUrls[0]}
                alt="Post image"
                className="w-full max-h-[600px] object-contain"
              />
            ) : (
              <div className="grid grid-cols-2 gap-0.5">
                {post.imageUrls.slice(0, 4).map((imageUrl: string, index: number) => (
                  <div
                    key={index}
                    className={`relative aspect-square bg-gray-900 ${post.imageUrls.length === 3 && index === 0 ? 'col-span-2' : ''
                      }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && post.imageUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          +{post.imageUrls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Double-click Like Animation */}
        <AnimatePresence>
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Like */}
            <motion.button
              onClick={handleLike}
              disabled={isLiking}
              whileTap={{ scale: 0.85 }}
              className="hover:opacity-60 transition-opacity duration-200"
            >
              <Heart
                className="w-7 h-7 transition-colors duration-200"
                style={{
                  color: liked ? '#EF4444' : '#111827',
                  fill: liked ? '#EF4444' : 'none',
                  strokeWidth: 2
                }}
              />
            </motion.button>

            {/* Comment */}
            <motion.button
              onClick={handleComment}
              whileTap={{ scale: 0.85 }}
              className="hover:opacity-60 transition-opacity duration-200"
            >
              <MessageCircle className="w-7 h-7" style={{ color: '#111827', strokeWidth: 2 }} />
            </motion.button>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.85 }}
              className="hover:opacity-60 transition-opacity duration-200"
            >
              <Share2 className="w-7 h-7" style={{ color: '#111827', strokeWidth: 2 }} />
            </motion.button>
          </div>

          {/* Bookmark */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="hover:opacity-60 transition-opacity duration-200"
          >
            <Bookmark className="w-6 h-6" style={{ color: '#111827', strokeWidth: 2 }} />
          </motion.button>
        </div>

        {/* Like Count */}
        {likeCount > 0 && (
          <div className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>
            {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
          </div>
        )}

        {/* Caption */}
        <div className="mb-2">
          {post.title && (
            <p className="text-sm mb-1">
              <Link 
                href={`/profile/${post.authorId}`} 
                className="font-semibold hover:opacity-60 transition-opacity duration-200"
                style={{ color: '#111827' }}
              >
                {post.authorUsername}
              </Link>
              <span className="font-semibold ml-2" style={{ color: '#111827' }}>{post.title}</span>
            </p>
          )}
          <p className="text-sm" style={{ lineHeight: '1.6' }}>
            <Link 
              href={`/profile/${post.authorId}`} 
              className="font-semibold hover:opacity-60 transition-opacity duration-200"
              style={{ color: '#111827' }}
            >
              {post.authorUsername}
            </Link>
            <span className="ml-2 whitespace-pre-wrap" style={{ color: '#111827' }}>{post.content}</span>
          </p>
        </div>

        {/* Comments Preview */}
        {post.commentCount > 0 && (
          <button
            onClick={handleComment}
            className="text-sm transition-colors duration-200 mb-1"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            View all {post.commentCount} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="text-xs uppercase mb-3" style={{ color: '#9CA3AF', fontWeight: 300 }}>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
      </div>

      {/* Add Comment */}
      <div className="px-3 py-2.5" style={{ borderTop: '1px solid #E5E7EB' }}>
        {user ? (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none"
              style={{ color: '#111827' }}
              onFocus={handleComment}
            />
            <button 
              className="text-sm font-semibold transition-colors duration-200 disabled:opacity-40"
              style={{ color: '#3B82F6' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#3B82F6'}
            >
              Post
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginRequired}
            className="text-sm transition-colors duration-200 w-full text-left"
            style={{ color: '#6B7280' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            Login to comment...
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <NestedComments postId={post.id} onLoginRequired={onLoginRequired} />
      )}
    </article>
  )
}
