'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './SocketProvider'
import { NotificationListener } from './NotificationListener'
import { ThemeProvider } from './ThemeProvider'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketProvider>
          {children}
          <NotificationListener />
          <Toaster position="top-right" />
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
