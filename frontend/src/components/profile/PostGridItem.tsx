'use client'

import { Heart, MessageCircle, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

interface Post {
  id: string
  imageUrls?: string[]
  content: string
  likes: number
  commentCount: number
}

interface PostGridItemProps {
  post: Post
  onClick: () => void
}

export function PostGridItem({ post, onClick }: PostGridItemProps) {
  const hasMultipleImages = post.imageUrls && post.imageUrls.length > 1
  const thumbnailUrl = post.imageUrls?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100"
      onClick={onClick}
    >
      {/* Image or Placeholder */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Post"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
          <p className="text-gray-600 text-sm line-clamp-6 text-center">
            {post.content}
          </p>
        </div>
      )}

      {/* Multiple Images Indicator */}
      {hasMultipleImages && (
        <div className="absolute top-2 right-2 z-10">
          <Layers className="w-5 h-5 text-white drop-shadow-lg" />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Heart className="w-6 h-6 fill-white" />
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-2 text-white font-semibold">
          <MessageCircle className="w-6 h-6 fill-white" />
          <span>{post.commentCount}</span>
        </div>
      </div>
    </motion.div>
  )
}
