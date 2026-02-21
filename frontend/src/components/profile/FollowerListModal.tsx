'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface UserBasic {
    id: string
    username: string
    displayName?: string
    profilePictureUrl?: string
    isFollowing?: boolean // Current user follows this user?
}

interface FollowerListModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    initialTab: 'followers' | 'following'
}

export function FollowerListModal({ isOpen, onClose, userId, initialTab }: FollowerListModalProps) {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
    const [users, setUsers] = useState<UserBasic[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()
    const { user: currentUser } = useAuthStore()

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab)
            loadUsers(1, initialTab, true)
        }
    }, [isOpen, initialTab])

    useEffect(() => {
        if (isOpen) {
            loadUsers(1, activeTab, true)
        }
    }, [activeTab])

    const loadUsers = async (pageNum: number, type: 'followers' | 'following', reset: boolean = false) => {
        try {
            setIsLoading(true)
            const endpoint = type === 'followers'
                ? `/users/${userId}/followers`
                : `/users/${userId}/following`

            const response = await api.get(endpoint, {
                params: { page: pageNum, limit: 20 }
            })

            const newUsers = response.data

            if (reset) {
                setUsers(newUsers)
            } else {
                setUsers(prev => [...prev, ...newUsers])
            }

            setHasMore(newUsers.length === 20)
            setPage(pageNum)
        } catch (error) {
            console.error('Failed to load users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFollowAction = async (targetUserId: string, isCurrentlyFollowing: boolean | undefined) => {
        try {
            if (isCurrentlyFollowing) {
                await api.delete(`/follow/${targetUserId}`)
            } else {
                await api.post(`/follow/${targetUserId}`)
            }

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === targetUserId
                    ? { ...u, isFollowing: !isCurrentlyFollowing }
                    : u
            ))
        } catch (error) {
            console.error('Failed to update follow status:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md h-[400px] sm:h-[500px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="w-8"></div> {/* Spacer for centering */}
                    <h2 className="font-semibold text-base">{activeTab === 'followers' ? 'Followers' : 'Following'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${activeTab === 'followers' ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 text-sm font-semibold transition-all duration-200 ${activeTab === 'following' ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Following
                    </button>
                </div>

                {/* Search - Standard Instagram doesn't show search here for other profiles usually, but nice to have */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && users.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-gray-500 font-medium">
                                {activeTab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                            </p>
                        </div>
                    ) : (
                        users.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div
                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                    onClick={() => {
                                        onClose()
                                        router.push(`/profile/${user.id}`)
                                    }}
                                >
                                    <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
                                        {user.profilePictureUrl ? (
                                            <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-semibold bg-gray-100">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm leading-tight text-gray-900">{user.username}</div>
                                        <div className="text-gray-500 text-sm leading-tight">{user.displayName || user.username}</div>
                                    </div>
                                </div>

                                {/* Follow Button - Should not show for self */}
                                {currentUser?.id !== user.id && (
                                    <button
                                        onClick={() => handleFollowAction(user.id, user.isFollowing)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${user.isFollowing
                                                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                                                : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                                            }`}
                                    >
                                        {user.isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        ))
                    )}

                    {/* Scroll Sentinel / Load More */}
                    {hasMore && !isLoading && users.length > 0 && (
                        <button
                            onClick={() => loadUsers(page + 1, activeTab)}
                            className="w-full py-2 text-sm text-[#0095F6] hover:text-[#1877F2] font-semibold transition-colors duration-200"
                        >
                            Load more
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
