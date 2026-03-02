'use client'

import { ReactNode } from 'react'
import { MainLayout } from './MainLayout'

interface InstagramLayoutProps {
  children: ReactNode
  showRightPanel?: boolean
  showMobileHeader?: boolean
}

export function InstagramLayout({ children, showRightPanel = true, showMobileHeader = true }: InstagramLayoutProps) {
  return (
    <MainLayout showMobileHeader={showMobileHeader}>
      {children}
    </MainLayout>
  )
}
