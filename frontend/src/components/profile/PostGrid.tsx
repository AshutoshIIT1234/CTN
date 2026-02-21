'use client'

import { PostGridItem } from './PostGridItem'
import { motion } from 'framer-motion'

interface Post {
  id: string
  imageUrls?: string[]
  content: string
  likes: number
  commentCount: number
}

interface PostGridProps {
  posts: Post[]
  loading?: boolean
  onPostClick?: (postId: string) => void
}

export function PostGrid({ posts, loading, onPostClick }: PostGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-7 p-1 md:p-0">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square bg-gray-200 animate-pulse rounded-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-20 h-20 rounded-full border-4 border-gray-900 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3">No Posts Yet</h3>
        <p className="text-gray-500 text-base">When you share photos, they'll appear here.</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-7 p-1 md:p-0">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <PostGridItem
            post={post}
            onClick={() => onPostClick?.(post.id)}
          />
        </motion.div>
      ))}
    </div>
  )
}
