'use client'

import { useState, useEffect } from 'react'
import { X, Heart, MessageCircle, Bookmark, Send, MoreHorizontal } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface Comment {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        username: string
        profilePictureUrl?: string
    }
}

interface PostDetail {
    id: string
    content: string
    imageUrls: string[]
    createdAt: string
    likes: number
    isLiked: boolean
    isSaved: boolean
    user: {
        id: string
        username: string
        profilePictureUrl?: string
    }
}

interface PostModalProps {
    postId: string
    onClose: () => void
}

export function PostModal({ postId, onClose }: PostModalProps) {
    const [post, setPost] = useState<PostDetail | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { user: currentUser } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (postId) {
            loadPostDetails()
            loadComments()
        }
    }, [postId])

    const loadPostDetails = async () => {
        try {
            const response = await api.get(`/posts/${postId}`)
            setPost(response.data)
        } catch (error) {
            console.error('Failed to load post:', error)
        }
    }

    const loadComments = async () => {
        try {
            // Assuming pagination, getting first page for now
            const response = await api.get(`/posts/${postId}/comments`)
            setComments(response.data.comments || response.data)
        } catch (error) {
            console.error('Failed to load comments:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLike = async () => {
        if (!post) return
        try {
            const newIsLiked = !post.isLiked
            setPost(prev => prev ? {
                ...prev,
                isLiked: newIsLiked,
                likes: prev.likes + (newIsLiked ? 1 : -1)
            } : null)

            if (newIsLiked) {
                await api.post(`/posts/${postId}/like`)
            } else {
                await api.delete(`/posts/${postId}/like`)
            }
        } catch (error) {
            console.error('Failed to toggle like:', error)
            // Revert on error
            loadPostDetails()
        }
    }

    const handleSave = async () => {
        if (!post) return
        try {
            const newIsSaved = !post.isSaved
            setPost(prev => prev ? {
                ...prev,
                isSaved: newIsSaved
            } : null)

            if (newIsSaved) {
                await api.post(`/posts/${postId}/save`)
            } else {
                await api.delete(`/posts/${postId}/save`)
            }
        } catch (error) {
            console.error('Failed to toggle save:', error)
            // Revert on error
            loadPostDetails()
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const response = await api.post(`/posts/${postId}/comments`, {
                content: newComment
            })

            const newCommentObj = response.data
            setComments(prev => [...prev, newCommentObj])
            setNewComment('')
        } catch (error) {
            console.error('Failed to post comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!postId) return null

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white hover:opacity-75 z-50">
                <X className="w-8 h-8" />
            </button>

            <div
                className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
                    </div>
                ) : post ? (
                    <>
                        {/* Media Section - Left Side */}
                        <div className="hidden md:flex items-center justify-center bg-black w-[60%] h-full relative">
                            {post.imageUrls[0] ? (
                                <img
                                    src={post.imageUrls[0]}
                                    alt="Post content"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="text-gray-500">No Image</div>
                            )}
                        </div>

                        {/* Details Section - Right Side */}
                        <div className="w-full md:w-[40%] flex flex-col h-full bg-white">

                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer" onClick={() => router.push(`/profile/${post.user.id}`)}>
                                        {post.user.profilePictureUrl ? (
                                            <img src={post.user.profilePictureUrl} alt={post.user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold bg-gray-100">
                                                {post.user.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-semibold text-sm cursor-pointer hover:opacity-80" onClick={() => router.push(`/profile/${post.user.id}`)}>
                                        {post.user.username}
                                    </span>
                                </div>
                                <button className="text-gray-900">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Comments & Caption - Scrollable Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Caption */}
                                {post.content && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                            {post.user.profilePictureUrl ? (
                                                <img src={post.user.profilePictureUrl} alt={post.user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold bg-gray-100">
                                                    {post.user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-semibold mr-2">{post.user.username}</span>
                                            <span>{post.content}</span>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Comments List */}
                                {comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${comment.user.id}`)}>
                                            {comment.user.profilePictureUrl ? (
                                                <img src={comment.user.profilePictureUrl} alt={comment.user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold bg-gray-100">
                                                    {comment.user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-semibold mr-2 cursor-pointer hover:opacity-80" onClick={() => router.push(`/profile/${comment.user.id}`)}>
                                                {comment.user.username}
                                            </span>
                                            <span>{comment.content}</span>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions Footer */}
                            <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <button onClick={handleLike} className="hover:opacity-60 transition-opacity">
                                            <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-black'}`} />
                                        </button>
                                        <button className="hover:opacity-60 transition-opacity">
                                            <MessageCircle className="w-6 h-6 -rotate-90 text-black" />
                                        </button>
                                        <button className="hover:opacity-60 transition-opacity">
                                            <Send className="w-6 h-6 text-black" />
                                        </button>
                                    </div>
                                    <button onClick={handleSave} className="hover:opacity-60 transition-opacity">
                                        <Bookmark className={`w-6 h-6 ${post.isSaved ? 'fill-black text-black' : 'text-black'}`} />
                                    </button>
                                </div>

                                <div className="font-semibold text-sm mb-2">{post.likes} likes</div>

                                <div className="text-xs text-gray-400 uppercase mb-3">
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </div>

                                {/* Add Comment Input */}
                                <form onSubmit={handleCommentSubmit} className="flex items-center border-t border-gray-100 pt-3 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="flex-1 text-sm outline-none"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    {newComment.trim() && (
                                        <button
                                            type="submit"
                                            className="text-blue-500 font-semibold text-sm hover:text-blue-700 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            Post
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <p>Post not found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
