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
'use client'

import { useState } from 'react'
import { Mail, ChevronDown } from 'lucide-react'
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
        <div className="flex items-center gap-2">
            <motion.button
                onClick={handleFollowClick}
                disabled={isLoading}
                className={`
                    px-5 py-2 font-bold text-sm rounded-xl 
                    transition-all duration-200 shadow-sm
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isFollowing
                        ? 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-dark-700 border border-gray-300 dark:border-dark-700'
                        : 'bg-[#0095F6] hover:bg-[#1877F2] text-white shadow-blue-200/50'
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
                className="w-10 h-10 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-slate-300 rounded-xl transition-all duration-200 flex items-center justify-center border border-gray-300 dark:border-dark-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Message"
            >
                <Mail className="w-4 h-4" />
            </motion.button>
        </div>
    )
}
