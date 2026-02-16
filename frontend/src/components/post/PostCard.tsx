'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Flag, MoreHorizontal, Eye, EyeOff, AlertTriangle, Repeat2, Share, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { CommentSection } from './CommentSection'

interface PostCardProps {
  post: any
  onUpdate: () => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuthStore()
  const [showComments, setShowComments] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if user is a moderator for college posts
  const isModerator = user?.role === 'MODERATOR' && post.panelType === 'COLLEGE'
  const isAdmin = user?.role === 'ADMIN'
  const canModerate = isModerator || isAdmin

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like posts')
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

  const handleReport = async () => {
    if (!user) {
      alert('Please sign in to report posts')
      return
    }
    
    const reason = prompt('Please provide a reason for reporting this post:')
    if (!reason) return

    try {
      await api.post(`/posts/${post.id}/report`, { reason })
      alert('Post reported successfully')
      setShowMenu(false)
    } catch (error) {
      console.error('Failed to report post:', error)
      alert('Failed to report post')
    }
  }

  const handleFlag = async () => {
    if (!canModerate) return
    
    const reason = prompt('Please provide a reason for flagging this post:')
    if (!reason) return

    setIsProcessing(true)
    try {
      await api.post(`/posts/${post.id}/flag`, { reason })
      alert('Post flagged successfully')
      setShowMenu(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to flag post:', error)
      alert('Failed to flag post')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHide = async () => {
    if (!canModerate) return
    
    if (!confirm('Are you sure you want to hide this post? It will be hidden from regular users.')) {
      return
    }

    setIsProcessing(true)
    try {
      await api.post(`/posts/${post.id}/hide`)
      alert('Post hidden successfully')
      setShowMenu(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to hide post:', error)
      alert('Failed to hide post')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this post',
          text: post.content,
          url: window.location.origin + `/posts/${post.id}`
        })
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
        alert('Failed to copy link')
      }
    }
  }

  const handleRepost = async () => {
    if (!user) {
      alert('Please sign in to repost')
      return
    }
    
    // For now, just show a message that repost functionality is coming soon
    alert('Repost functionality coming soon!')
  }

  const handleBookmark = async () => {
    if (!user) {
      alert('Please sign in to bookmark posts')
      return
    }
    
    // For now, just show a message that bookmark functionality is coming soon
    alert('Bookmark functionality coming soon!')
  }

  const handleUnhide = async () => {
    if (!canModerate) return
    
    setIsProcessing(true)
    try {
      await api.post(`/posts/${post.id}/unhide`)
      alert('Post unhidden successfully')
      setShowMenu(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to unhide post:', error)
      alert('Failed to unhide post')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <article className={`border-b border-gray-800 hover:bg-gray-950/50 transition-colors cursor-pointer p-4 ${post.isHidden ? 'opacity-60 border-l-4 border-yellow-400' : ''} ${post.isFlagged ? 'border-l-4 border-red-400' : ''}`}>
      {/* Moderation Status Indicators */}
      {(post.isFlagged || post.isHidden) && canModerate && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            {post.isFlagged && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Flagged</span>
                {post.flagReason && (
                  <span className="text-sm">- {post.flagReason}</span>
                )}
              </div>
            )}
            {post.isHidden && (
              <div className="flex items-center gap-2 text-yellow-400">
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">Hidden from users</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg font-semibold">
            {post.authorUsername[0].toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white hover:underline cursor-pointer">
              {post.authorName}
            </span>
            <span className="text-gray-500">
              @{post.authorUsername}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 hover:underline cursor-pointer">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            
            {user && (
              <div className="ml-auto relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-800 transition-colors"
                  disabled={isProcessing}
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-10"
                  >
                    {/* Regular user actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReport()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition-colors text-left"
                    >
                      <Flag className="w-4 h-4 text-gray-500" />
                      <span className="text-white">Report post</span>
                    </button>

                    {/* Moderator actions for college posts */}
                    {canModerate && post.panelType === 'COLLEGE' && (
                      <>
                        <div className="border-t border-gray-800"></div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFlag()
                          }}
                          disabled={isProcessing}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition-colors text-left disabled:opacity-50"
                        >
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          <span className="text-white">Flag Post</span>
                        </button>

                        {post.isHidden ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnhide()
                            }}
                            disabled={isProcessing}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition-colors text-left disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4 text-green-400" />
                            <span className="text-white">Unhide Post</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleHide()
                            }}
                            disabled={isProcessing}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition-colors text-left disabled:opacity-50"
                          >
                            <EyeOff className="w-4 h-4 text-red-400" />
                            <span className="text-white">Hide Post</span>
                          </button>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-3">
            {post.title && (
              <h3 className="text-white font-medium mb-1">
                {post.title}
              </h3>
            )}
            <p className="text-white whitespace-pre-wrap leading-normal">
              {post.content}
            </p>
          </div>

          {/* Post Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-gray-800 ${
              post.imageUrls.length === 1 ? '' : 
              post.imageUrls.length === 2 ? 'grid grid-cols-2 gap-0.5' :
              post.imageUrls.length === 3 ? 'grid grid-cols-2 gap-0.5' :
              'grid grid-cols-2 gap-0.5'
            }`}>
              {post.imageUrls.slice(0, 4).map((imageUrl: string, index: number) => (
                <div 
                  key={index} 
                  className={`relative ${
                    post.imageUrls.length === 3 && index === 0 ? 'col-span-2' : ''
                  } ${
                    post.imageUrls.length === 1 ? 'aspect-video' : 'aspect-square'
                  } bg-gray-900`}
                >
                  <img
                    src={imageUrl}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Open image in new tab or lightbox
                      window.open(imageUrl, '_blank')
                    }}
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

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!user) {
                  alert('Please sign in to comment on posts')
                  return
                }
                setShowComments(!showComments)
              }}
              className={`flex items-center gap-2 transition-colors group ${
                !user 
                  ? 'text-gray-500 opacity-70 cursor-pointer' 
                  : 'text-gray-500 hover:text-primary-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-primary-900/20 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">{post.commentCount}</span>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation()
                handleRepost()
              }}
              className={`flex items-center gap-2 transition-colors group ${
                !user 
                  ? 'text-gray-500 opacity-70 cursor-pointer' 
                  : 'text-gray-500 hover:text-green-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-900/20 transition-colors">
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="text-sm">0</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleLike()
              }}
              className={`flex items-center gap-2 transition-colors group ${
                post.isLiked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-400'
              } ${!user ? 'opacity-70 cursor-pointer' : ''}`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                post.isLiked 
                  ? 'bg-red-900/20' 
                  : 'group-hover:bg-red-900/20'
              }`}>
                <Heart
                  className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                />
              </div>
              <span className="text-sm">{post.likes}</span>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation()
                handleBookmark()
              }}
              className={`flex items-center gap-2 transition-colors group ${
                !user 
                  ? 'text-gray-500 opacity-70 cursor-pointer' 
                  : 'text-gray-500 hover:text-primary-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-primary-900/20 transition-colors">
                <Bookmark className="w-5 h-5" />
              </div>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-primary-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-primary-900/20 transition-colors">
                <Share className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-800"
            >
              <CommentSection postId={post.id} onUpdate={onUpdate} />
            </motion.div>
          )}
        </div>
      </div>
    </article>
  )
}
