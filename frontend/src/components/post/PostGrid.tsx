'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PostModal } from './PostModal'

interface Post {
    id: string
    imageUrls: string[]
    likes: number
    commentCount: number
    type?: 'NATIONAL' | 'COLLEGE'
}

interface PostGridProps {
    posts: Post[]
    loading?: boolean
}

export function PostGrid({ posts, loading }: PostGridProps) {
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
    const router = useRouter()

    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-100 dark:bg-dark-800 animate-pulse rounded-2xl" />
                ))}
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 border-2 border-slate-900 dark:border-white rounded-full flex items-center justify-center mb-6">
                    <Copy className="w-10 h-10 text-slate-900 dark:text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Intellectual Output Yet</h3>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-1 sm:gap-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        onClick={() => setSelectedPostId(post.id)}
                        className="relative group aspect-square cursor-pointer overflow-hidden bg-slate-100 dark:bg-dark-800 rounded-2xl border border-slate-50 dark:border-dark-800 shadow-sm"
                    >
                        {post.imageUrls[0] ? (
                            <img
                                src={post.imageUrls[0]}
                                alt="Post"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-dark-800 text-slate-400">
                                No Visualization
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                            <div className="flex items-center gap-2">
                                <Heart className="w-6 h-6 fill-white" />
                                <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-6 h-6 fill-white" />
                                <span>{post.commentCount}</span>
                            </div>
                        </div>

                        {/* Type Indicator */}
                        {post.type === 'COLLEGE' && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-royal-600/80 text-white text-xs font-bold rounded-md backdrop-blur-sm">
                                COLLEGE
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedPostId && (
                <PostModal
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                />
            )}
        </>
    )
}
