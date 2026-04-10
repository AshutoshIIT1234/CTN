'use client'

import { useState } from 'react'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Crown,
  ShieldCheck,
  Eye,
} from 'lucide-react'
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

export function InstagramPostCard({
  post,
  onUpdate,
  onLoginRequired,
}: InstagramPostCardProps) {
  const { user } = useAuthStore()
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(post.isLiked)
  const [saved, setSaved] = useState(post.isSaved)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)

  /* ── Actions ──────────────────────────────────────────────── */
  const handleLike = async () => {
    if (!user) { onLoginRequired?.(); return }
    if (isLiking) return

    const prevLiked = liked
    const prevCount = likeCount
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)

    setIsLiking(true)
    try {
      await api.post(`/posts/${post.id}/like`)
      onUpdate()
    } catch {
      setLiked(prevLiked)
      setLikeCount(prevCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (!user) { onLoginRequired?.(); return }
    if (isSaving) return

    const prevSaved = saved
    setSaved(!saved)

    setIsSaving(true)
    try {
      if (saved) {
        await api.delete(`/posts/${post.id}/save`)
      } else {
        await api.post(`/posts/${post.id}/save`)
      }
      onUpdate()
    } catch {
      setSaved(prevSaved)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDoubleClick = () => {
    if (!user || liked) return
    setShowLikeAnimation(true)
    handleLike()
    setTimeout(() => setShowLikeAnimation(false), 900)
  }

  const handleComment = () => {
    if (!user) { onLoginRequired?.(); return }
    setShowComments((v) => !v)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this thought on CTN',
          text: post.content,
          url: `${window.location.origin}/posts/${post.id}`,
        })
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/posts/${post.id}`
        )
      } catch {
        /* noop */
      }
    }
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="feed-card mb-3 md:mb-6 md:rounded-[32px] relative group"
      /* double-tap to like */
      onDoubleClick={handleDoubleClick}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-4 pb-3">
        {/* Author */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/profile/${post.authorId}`}
            className="relative flex-shrink-0 group/avatar"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] overflow-hidden p-[2px] bg-gradient-to-tr from-blue-600 to-indigo-600 group-hover/avatar:rotate-6 transition-transform duration-300">
              {post.authorProfilePictureUrl ? (
                <img
                  src={post.authorProfilePictureUrl}
                  className="w-full h-full rounded-[11px] object-cover border-2 border-white dark:border-dark-900"
                  alt=""
                />
              ) : (
                <div className="w-full h-full rounded-[11px] bg-slate-50 dark:bg-dark-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black border-2 border-white dark:border-dark-900 text-sm">
                  {post.authorUsername?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {post.isAuthorPremium && (
              <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-amber-400 rounded-lg flex items-center justify-center border-2 border-white dark:border-dark-900 shadow-sm">
                <Crown className="w-2 h-2 md:w-2.5 md:h-2.5 text-white fill-white" />
              </div>
            )}
          </Link>

          {/* Identity */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.authorId}`}
                className="text-[14px] md:text-[15px] font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
              >
                {post.authorUsername}
              </Link>
              {post.isAuthorVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50 flex-shrink-0" />
              )}
              {post.panelType === 'COLLEGE' && (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-dark-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Campus
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.collegeName && (
                <>
                  <span className="text-slate-200 dark:text-slate-700">·</span>
                  <span className="text-[11px] font-black text-indigo-500/80 uppercase tracking-tight truncate">
                    {post.collegeName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* More button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors flex-shrink-0"
          style={{ touchAction: 'manipulation' }}
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ── Content Body ────────────────────────────────────── */}
      <div className="px-4 md:px-6 pb-3 relative">
        {post.title && (
          <h2 className="text-[16px] md:text-[18px] font-black text-slate-900 dark:text-white mb-2 tracking-tight leading-snug">
            {post.title}
          </h2>
        )}
        <p className="text-[14px] md:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Images */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-800">
            <div
              className={`grid gap-0.5 ${
                post.imageUrls.length === 1
                  ? 'grid-cols-1'
                  : post.imageUrls.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2'
              }`}
            >
              {post.imageUrls.slice(0, 4).map((url: string, i: number) => (
                <div
                  key={i}
                  className={`relative bg-slate-100 dark:bg-dark-700 overflow-hidden ${
                    post.imageUrls.length === 1 ? 'aspect-video' : 'aspect-square'
                  } ${post.imageUrls.length === 3 && i === 0 ? 'col-span-2 aspect-video' : ''}`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {post.imageUrls.length > 4 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-black px-2 py-1 rounded-lg">
                +{post.imageUrls.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Double-tap heart animation */}
        <AnimatePresence>
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <Heart className="w-28 h-28 md:w-32 md:h-32 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Interaction Row ──────────────────────────────────── */}
      <div className="px-3 md:px-6 py-3 flex items-center justify-between border-t border-slate-50 dark:border-dark-800 bg-slate-50/30 dark:bg-dark-950/20">
        {/* Left: Like · Comment · Share */}
        <div className="flex items-center gap-1">
          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            onClick={handleLike}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors"
            style={{ touchAction: 'manipulation', minWidth: 52, minHeight: 40 }}
            aria-label={liked ? 'Unlike' : 'Like'}
            aria-pressed={liked}
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                liked ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-400'
              }`}
              strokeWidth={liked ? 0 : 2}
            />
            <span
              className={`text-[13px] font-black transition-colors ${
                liked ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {likeCount > 0 ? likeCount.toLocaleString() : ''}
            </span>
          </motion.button>

          {/* Comment */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            onClick={handleComment}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
              showComments
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400'
            }`}
            style={{ touchAction: 'manipulation', minWidth: 52, minHeight: 40 }}
            aria-label="Comment"
            aria-expanded={showComments}
          >
            <MessageCircle
              className="w-5 h-5"
              strokeWidth={showComments ? 2.5 : 2}
            />
            {post.commentCount > 0 && (
              <span className="text-[13px] font-black">
                {post.commentCount}
              </span>
            )}
          </motion.button>

          {/* Impressions */}
          {(post.impressions > 0 || post.impressions !== undefined) && (
            <div className="flex items-center gap-1.5 px-3 py-2 text-slate-400">
              <Eye className="w-5 h-5" strokeWidth={2} />
              <span className="text-[13px] font-black">
                {post.impressions?.toLocaleString() || 0}
              </span>
            </div>
          )}

          {/* Share */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-green-600 transition-colors"
            style={{ touchAction: 'manipulation' }}
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" strokeWidth={2} />
          </motion.button>
        </div>

        {/* Right: Bookmark */}
        <motion.button
          whileTap={{ scale: 0.78 }}
          onClick={handleSave}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
            saved
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
          }`}
          style={{ touchAction: 'manipulation' }}
          aria-label={saved ? 'Unsave' : 'Save'}
          aria-pressed={saved}
        >
          <Bookmark
            className={`w-5 h-5 transition-all ${saved ? 'fill-amber-500 dark:fill-amber-400' : ''}`}
            strokeWidth={saved ? 0 : 2}
          />
        </motion.button>
      </div>

      {/* ── Comments Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="h-px bg-slate-100 dark:bg-dark-800" />
            <div className="px-4 md:px-6 py-4 bg-slate-50/50 dark:bg-dark-900/50">
              <NestedComments
                postId={post.id}
                onLoginRequired={onLoginRequired}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
