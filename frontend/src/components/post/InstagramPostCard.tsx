'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { NestedComments } from './NestedComments'

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
    <article className="bg-white border border-gray-200 rounded-lg mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {post.authorUsername[0].toUpperCase()}
            </span>
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 hover:text-gray-600 cursor-pointer">
                {post.authorUsername}
              </span>
              {post.panelType === 'COLLEGE' && (
                <span className="text-xs bg-royal-100 text-royal-700 px-2 py-0.5 rounded-full">
                  🏛️ {post.collegeName || 'College'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* More Options */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
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
                    className={`relative aspect-square bg-gray-900 ${
                      post.imageUrls.length === 3 && index === 0 ? 'col-span-2' : ''
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

        <div className="px-4 pb-3 pt-3">
          {post.title && (
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {post.title}
            </h3>
          )}
          <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Double-click Like Animation */}
        <AnimatePresence>
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="hover:opacity-60 transition-opacity"
            >
              <Heart
                className={`w-6 h-6 ${
                  liked
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-900'
                }`}
              />
            </button>

            {/* Comment */}
            <button
              onClick={handleComment}
              className="hover:opacity-60 transition-opacity"
            >
              <MessageCircle className="w-6 h-6 text-gray-900" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="hover:opacity-60 transition-opacity"
            >
              <Share2 className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          {/* Bookmark */}
          <button className="hover:opacity-60 transition-opacity">
            <Bookmark className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Like Count */}
        <div className="text-sm font-semibold text-gray-900 mb-2">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </div>

        {/* Comments Preview */}
        {post.commentCount > 0 && (
          <button
            onClick={handleComment}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            View all {post.commentCount} comments
          </button>
        )}

        {/* Add Comment */}
        {user && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none"
              onFocus={handleComment}
            />
            <button className="text-sm font-semibold text-royal-600 hover:text-royal-700">
              Post
            </button>
          </div>
        )}

        {!user && (
          <button
            onClick={onLoginRequired}
            className="text-sm text-gray-500 hover:text-gray-700 pt-2 border-t border-gray-100 w-full text-left"
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
