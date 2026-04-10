'use client'

import { useState } from 'react'
import { UserPlus, Mail, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface ProfileActionsProps {
    isOwnProfile: boolean
    isFollowing?: boolean
    onEditClick: () => void
    onFollowClick?: () => void
    onMessageClick?: () => void
    targetUserId?: string
}

export function ProfileActions({
    isOwnProfile,
    isFollowing,
    onEditClick,
    onFollowClick,
    onMessageClick,
    targetUserId
}: ProfileActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleFollowClick = async () => {
        if (!onFollowClick) return
        setIsLoading(true)
        try {
            await onFollowClick()
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="flex gap-2 w-full md:w-auto">
            <motion.button
                onClick={handleFollowClick}
                disabled={isLoading}
                className={`
                    flex-1 md:flex-none px-8 py-2 font-bold text-sm rounded-lg 
                    transition-all duration-200 shadow-sm
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isFollowing
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                        : 'bg-[#0095F6] hover:bg-[#1877F2] text-white shadow-blue-200'
                    }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-1.5">
                        {isFollowing ? (
                            <>
                                Following
                                <ChevronDown className="w-3.5 h-3.5" />
                            </>
                        ) : (
                            'Follow'
                        )}
                    </span>
                )}
            </motion.button>

            <motion.button
                onClick={onMessageClick || (() => router.push(`/messages?userId=${targetUserId}`))}
                className="flex-1 md:flex-none px-6 py-2 bg-gray-100 hover:bg-gray-200 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Mail className="w-4 h-4" />
                <span>Message</span>
            </motion.button>

            <motion.button
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 border border-gray-300"
                aria-label="Suggest user"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <UserPlus className="w-5 h-5 text-gray-700" />
            </motion.button>
        </div>
    )
}
