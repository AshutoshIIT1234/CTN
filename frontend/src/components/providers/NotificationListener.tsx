'use client'

import { useEffect } from 'react'
import { useSocket } from './SocketProvider'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function NotificationListener() {
    const { socket } = useSocket()
    const router = useRouter()

    useEffect(() => {
        if (!socket) return

        socket.on('notification:new', (notification: any) => {
            toast(notification.message, {
                icon: '🔔',
                duration: 4000,
                position: 'top-right',
                style: {
                    background: '#333',
                    color: '#fff',
                }
            })
        })

        socket.on('message:new', (message: any) => {
            // Only show toast if not on the messages page for this user
            // simplified logic for now
            if (!window.location.pathname.includes('/messages')) {
                toast(`New message from ${message.sender?.username || 'User'}`, {
                    icon: '💬',
                    duration: 4000
                })
            }
        })

        return () => {
            socket.off('notification:new')
            socket.off('message:new')
        }
    }, [socket, router])

    return null
}
