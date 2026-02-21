'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const { user, token } = useAuthStore()

    useEffect(() => {
        if (!user || !token) {
            if (socket) {
                socket.disconnect()
                setSocket(null)
                setIsConnected(false)
            }
            return
        }

        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            auth: {
                token: token
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        socketInstance.on('connect', () => {
            console.log('Socket connected')
            setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected')
            setIsConnected(false)
        })

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connection error:', err)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [user?.id, token])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
