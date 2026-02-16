'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share, Bookmark, Lock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface PremiumPostCardProps {
  post: any
  onUpdate: () => void
  onLoginRequired: (message: string) => void
}

export function PremiumPostCard({ post, onUpdate, onLoginRequired }: PremiumPostCardProps) {
  const { user } = useAuthStore()
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (!user) {
      onLoginRequired('Sign in to like posts and engage with the community')
      return
    }
    
    if (isLiking) return
    
    setIsLiking(true)
    try {
      await api.post(`/posts/${post.id}/like`)
      onUpdate()
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = () => {
    if (!user) {
      onLoginRequired('Join the discussion by signing in')
      return
    }
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
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  const handleBookmark = () => {
    if (!user) {
      onLoginRequired('Sign in to bookmark posts for later')
      return
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-6 group relative"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-royal-500/0 via-primary-500/0 to-royal-500/0 group-hover:from-royal-500/5 group-hover:via-primary-500/5 group-hover:to-royal-500/5 rounded-2xl transition-all duration-500 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center ring-2 ring-primary-500/20">
              <span className="text-white text-lg font-semibold">
                {post.authorUsername[0].toUpperCase()}
              </span>
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-navy-900" />
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-navy-50 hover:text-primary-400 cursor-pointer transition-colors">
                {post.authorName}
              </span>
              <span className="text-navy-400">@{post.authorUsername}</span>
              {post.panelType === 'COLLEGE' && (
                <span className="badge-intellectual">
                  🏛️ {post.collegeName || 'College'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-400 mt-1">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {post.likes > 50 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-primary-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          {post.title && (
            <h3 className="text-xl font-display font-semibold text-navy-50 mb-2 leading-tight">
              {post.title}
            </h3>
          )}
          <p className="text-navy-200 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 transition-all group/btn ${
                post.isLiked
                  ? 'text-danger-500'
                  : user
                  ? 'text-navy-400 hover:text-danger-400'
                  : 'text-navy-500 cursor-pointer'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                post.isLiked
                  ? 'bg-danger-500/20'
                  : 'group-hover/btn:bg-danger-500/10'
              }`}>
                <Heart
                  className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                />
              </div>
              <span className="text-sm font-medium">{post.likes}</span>
              {!user && <Lock className="w-3 h-3" />}
            </button>

            {/* Comment Button */}
            <button
              onClick={handleComment}
              className={`flex items-center gap-2 transition-all group/btn ${
                user
                  ? 'text-navy-400 hover:text-primary-400'
                  : 'text-navy-500 cursor-pointer'
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-primary-500/10 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{post.commentCount}</span>
              {!user && <Lock className="w-3 h-3" />}
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 transition-all group/btn ${
                user
                  ? 'text-navy-400 hover:text-royal-400'
                  : 'text-navy-500 cursor-pointer'
              }`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-royal-500/10 transition-colors">
                <Bookmark className="w-5 h-5" />
              </div>
              {!user && <Lock className="w-3 h-3" />}
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-navy-400 hover:text-navy-50 transition-all group/btn"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-white/5 transition-colors">
              <Share className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Guest Overlay Hint */}
        {!user && (
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </motion.article>
  )
}
