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
                    <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
                ))}
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
                    <Copy className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
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
                        className="relative group aspect-square cursor-pointer overflow-hidden bg-gray-100"
                    >
                        {post.imageUrls[0] ? (
                            <img
                                src={post.imageUrls[0]}
                                alt="Post"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                No Image
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
