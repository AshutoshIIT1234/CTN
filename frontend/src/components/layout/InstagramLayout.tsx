'use client'

import { ReactNode } from 'react'
import { MainLayout } from './MainLayout'

interface InstagramLayoutProps {
  children: ReactNode
  showRightPanel?: boolean
}

export function InstagramLayout({ children, showRightPanel = true }: InstagramLayoutProps) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  )
}
