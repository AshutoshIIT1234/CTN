'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Crown, ShieldCheck } from 'lucide-react'
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
  const [isSaving, setIsSaving] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(post.isLiked)
  const [saved, setSaved] = useState(post.isSaved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)

  const handleLike = async () => {
    if (!user) {
      onLoginRequired?.()
      return
    }

    if (isLiking) return

    const previousLiked = liked
    const previousLikeCount = likeCount

    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)

    setIsLiking(true)
    try {
      await api.post(`/posts/${post.id}/like`)
      onUpdate()
    } catch (error) {
      setLiked(previousLiked)
      setLikeCount(previousLikeCount)
      console.error('Failed to like post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      onLoginRequired?.()
      return
    }

    if (isSaving) return

    const previousSaved = saved
    setSaved(!saved)

    setIsSaving(true)
    try {
      if (saved) {
        await api.delete(`/posts/${post.id}/save`)
      } else {
        await api.post(`/posts/${post.id}/save`)
      }
      onUpdate()
    } catch (error) {
      setSaved(previousSaved)
      console.error('Failed to save post:', error)
    } finally {
      setIsSaving(false)
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
          title: post.title || 'Check out this thought on CTN',
          text: post.content,
          url: window.location.origin + `/posts/${post.id}`
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-900 mb-6 rounded-[32px] border border-slate-100 dark:border-dark-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden relative group"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          {/* Avatar Container */}
          <Link href={`/profile/${post.authorId}`} className="relative group/avatar">
            <div className="w-11 h-11 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600 group-hover/avatar:rotate-6 transition-transform duration-300">
              {post.authorProfilePictureUrl ? (
                <img src={post.authorProfilePictureUrl} className="w-full h-full rounded-[14px] object-cover border-2 border-white" alt="" />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-slate-50 flex items-center justify-center text-blue-600 font-black border-2 border-white text-sm">
                  {post.authorUsername[0].toUpperCase()}
                </div>
              )}
            </div>
            {post.isAuthorPremium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                <Crown className="w-2.5 h-2.5 text-white fill-white" />
              </div>
            )}
          </Link>

          {/* Identity & Metadata */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/profile/${post.authorId}`}
                className="text-[15px] font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {post.authorUsername}
              </Link>
              {post.isAuthorVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
              )}
              {post.panelType === 'COLLEGE' && (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-dark-800 px-2 py-0.5 rounded-full">
                  Institutional
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-bold text-slate-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.collegeName && (
                <>
                  <span className="text-slate-200">|</span>
                  <span className="text-[11px] font-black text-indigo-500/80 uppercase tracking-tight">
                    {post.collegeName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-dark-800 transition-all group">
          <MoreHorizontal className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </button>
      </div>

      {/* Content Body */}
      <div
        className="px-6 pb-2"
        onDoubleClick={handleDoubleClick}
      >
        {post.title && (
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-snug">
            {post.title}
          </h2>
        )}
        <div className="relative">
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Post Images if any */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mt-4 rounded-[24px] overflow-hidden border border-slate-100 dark:border-dark-800 bg-slate-50">
              <div className={`grid gap-1 ${post.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {post.imageUrls.slice(0, 4).map((url: string, i: number) => (
                  <div key={i} className={`relative aspect-video bg-white overflow-hidden ${post.imageUrls.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <Heart className="w-32 h-32 text-red-500 fill-red-500 blur-[2px] opacity-20" />
              <Heart className="absolute w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactions Area */}
      <div className="px-6 py-5 flex items-center justify-between border-t border-slate-50 dark:border-dark-800 mt-4 bg-slate-50/30 dark:bg-dark-950/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          {/* Like Interaction */}
          <div className="flex items-center gap-2 group/btn">
            <motion.button
              onClick={handleLike}
              whileTap={{ scale: 0.8 }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-white dark:bg-dark-900 text-slate-400 group-hover/btn:bg-red-50 group-hover/btn:text-red-500'
                } shadow-sm border border-transparent hover:border-red-100`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} strokeWidth={liked ? 0 : 2} />
            </motion.button>
            <span className={`text-sm font-black tracking-tight ${liked ? 'text-red-500' : 'text-slate-400'}`}>
              {likeCount > 0 ? likeCount.toLocaleString() : 'Thought'}
            </span>
          </div>

          {/* Comment Interaction */}
          <div className="flex items-center gap-2 group/btn cursor-pointer" onClick={handleComment}>
            <motion.div
              whileTap={{ scale: 0.8 }}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 flex items-center justify-center text-slate-400 group-hover/btn:bg-blue-50 group-hover/btn:text-blue-600 shadow-sm border border-transparent hover:border-blue-100 transition-all font-bold"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.div>
            <span className="text-sm font-black text-slate-400 group-hover/btn:text-blue-600 tracking-tight">
              {post.commentCount || 'Discuss'}
            </span>
          </div>

          {/* Share Interaction */}
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.8 }}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 flex items-center justify-center text-slate-400 hover:bg-green-50 hover:text-green-600 shadow-sm border border-transparent hover:border-green-100 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Bookmark Interaction */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.8 }}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${saved
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-white dark:bg-dark-900 text-slate-400 dark:text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-500 dark:hover:text-amber-400'
            } shadow-sm border border-transparent hover:border-amber-100 dark:hover:border-amber-500/20`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-600 dark:fill-amber-400' : ''}`} strokeWidth={saved ? 0 : 2} />
        </motion.button>
      </div>

      {/* Comments Drawer/Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white/50 dark:bg-dark-900/50"
          >
            <div className="h-[1px] bg-slate-100 dark:bg-dark-800" />
            <div className="p-6">
              <NestedComments postId={post.id} onLoginRequired={onLoginRequired} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

