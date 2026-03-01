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
    authorId?: string
    authorUsername?: string
    authorName?: string
    // Normalised shape (built from flat fields)
    user?: {
        id: string
        username: string
        profilePictureUrl?: string
    }
}

interface PostDetail {
    id: string
    content: string
    title?: string
    imageUrls: string[]
    createdAt: string
    likes: number
    isLiked: boolean
    isSaved: boolean
    // Flat fields returned by backend
    authorId?: string
    authorUsername?: string
    authorName?: string
    authorRole?: string
    // Normalised shape (built from flat fields)
    user?: {
        id: string
        username: string
        profilePictureUrl?: string
    }
}

interface PostModalProps {
    postId: string
    onClose: () => void
}

/** Normalise a flat backend post into a shape the modal can render */
function normalisePost(raw: any): PostDetail {
    return {
        ...raw,
        user: raw.user ?? {
            id: raw.authorId ?? '',
            username: raw.authorUsername ?? raw.authorName ?? 'Unknown',
            profilePictureUrl: raw.authorProfilePictureUrl ?? undefined,
        },
    }
}

/** Normalise a flat backend comment into a shape the modal can render */
function normaliseComment(raw: any): Comment {
    return {
        ...raw,
        user: raw.user ?? {
            id: raw.authorId ?? '',
            username: raw.authorUsername ?? raw.authorName ?? 'Unknown',
            profilePictureUrl: raw.authorProfilePictureUrl ?? undefined,
        },
    }
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
            setPost(normalisePost(response.data))
        } catch (error) {
            console.error('Failed to load post:', error)
        }
    }

    const loadComments = async () => {
        try {
            const response = await api.get(`/posts/${postId}/comments`)
            const raw = response.data.comments ?? response.data
            setComments(Array.isArray(raw) ? raw.map(normaliseComment) : [])
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

            setComments(prev => [...prev, normaliseComment(response.data)])
            setNewComment('')
        } catch (error) {
            console.error('Failed to post comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!postId) return null

    // Resolve the author display – safe regardless of whether user shape is present
    const authorUser = post?.user
    const authorInitial = (authorUser?.username?.[0] ?? 'U').toUpperCase()

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white hover:opacity-75 z-50">
                <X className="w-8 h-8" />
            </button>

            <div
                className="bg-white dark:bg-dark-900 rounded-[32px] w-full max-w-6xl h-[90vh] flex overflow-hidden animate-in fade-in zoom-in duration-300 border border-white dark:border-white/10 shadow-3xl"
                onClick={e => e.stopPropagation()}
            >
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-dark-900">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 dark:border-dark-800 border-t-blue-600"></div>
                    </div>
                ) : post ? (
                    <>
                        {/* Media Section - Left Side */}
                        <div className="hidden md:flex items-center justify-center bg-slate-50 dark:bg-[#020617] w-[60%] h-full relative border-r border-slate-50 dark:border-dark-800">
                            {post.imageUrls?.[0] ? (
                                <img
                                    src={post.imageUrls[0]}
                                    alt="Post content"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Intellectual Thesis</div>
                                    {post.title && (
                                        <h2 className="text-xl font-black text-slate-700 dark:text-slate-200 leading-tight">{post.title}</h2>
                                    )}
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">{post.content}</p>
                                </div>
                            )}
                        </div>

                        {/* Details Section - Right Side */}
                        <div className="w-full md:w-[40%] flex flex-col h-full bg-white dark:bg-dark-900">

                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-50 dark:border-dark-800 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-dark-800 p-0.5 overflow-hidden cursor-pointer"
                                        onClick={() => authorUser?.id && router.push(`/profile/${authorUser.id}`)}
                                    >
                                        {authorUser?.profilePictureUrl ? (
                                            <img src={authorUser.profilePictureUrl} alt={authorUser.username} className="w-full h-full object-cover rounded-[14px]" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-black bg-slate-50 dark:bg-dark-800">
                                                {authorInitial}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className="font-black text-sm text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                                        onClick={() => authorUser?.id && router.push(`/profile/${authorUser.id}`)}
                                    >
                                        {authorUser?.username ?? 'Unknown'}
                                    </span>
                                </div>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors text-slate-400">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Comments & Caption - Scrollable Area */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                                {/* Caption / Content */}
                                {post.content && (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-dark-800 flex-shrink-0 overflow-hidden">
                                            {authorUser?.profilePictureUrl ? (
                                                <img src={authorUser.profilePictureUrl} alt={authorUser.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-black">
                                                    {authorInitial}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-black text-slate-900 dark:text-white mr-2">{authorUser?.username ?? 'Unknown'}</span>
                                            <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</span>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-3">
                                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-dark-700" />
                                                <span>Publication</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Comments List */}
                                {comments.map(comment => {
                                    const cUser = comment.user
                                    const cInitial = (cUser?.username?.[0] ?? 'U').toUpperCase()
                                    return (
                                        <div key={comment.id} className="flex gap-4">
                                            <div
                                                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-dark-800 flex-shrink-0 overflow-hidden cursor-pointer"
                                                onClick={() => cUser?.id && router.push(`/profile/${cUser.id}`)}
                                            >
                                                {cUser?.profilePictureUrl ? (
                                                    <img src={cUser.profilePictureUrl} alt={cUser.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-black">
                                                        {cInitial}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm">
                                                <span
                                                    className="font-black text-slate-900 dark:text-white mr-2 cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => cUser?.id && router.push(`/profile/${cUser.id}`)}
                                                >
                                                    {cUser?.username ?? 'Unknown'}
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.content}</span>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-4">
                                                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    <button className="hover:text-slate-600 dark:hover:text-slate-200">Refute</button>
                                                    <button className="hover:text-slate-600 dark:hover:text-slate-200">Endorse</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Actions Footer */}
                            <div className="border-t border-slate-50 dark:border-dark-800 p-5 bg-white dark:bg-dark-900 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-5">
                                        <button onClick={handleLike} className="hover:scale-110 active:scale-95 transition-all">
                                            <Heart className={`w-7 h-7 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`} />
                                        </button>
                                        <button className="hover:scale-110 active:scale-95 transition-all">
                                            <MessageCircle className="w-7 h-7 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white" />
                                        </button>
                                        <button className="hover:scale-110 active:scale-95 transition-all">
                                            <Send className="w-7 h-7 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white" />
                                        </button>
                                    </div>
                                    <button onClick={handleSave} className="hover:scale-110 active:scale-95 transition-all">
                                        <Bookmark className={`w-7 h-7 ${post.isSaved ? 'fill-slate-900 dark:fill-white text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`} />
                                    </button>
                                </div>

                                <div className="font-black text-base text-slate-900 dark:text-white mb-2 tracking-tight">{post.likes.toLocaleString()} Intellectual Confirmations</div>

                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    Disseminated {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>

                                {/* Add Comment Input */}
                                <form onSubmit={handleCommentSubmit} className="flex items-center border-t border-slate-50 dark:border-dark-800 pt-5 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a thought..."
                                        className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    {newComment.trim() && (
                                        <button
                                            type="submit"
                                            className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest hover:text-blue-700 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            Publish
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-slate-900 dark:text-white">Post not found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
