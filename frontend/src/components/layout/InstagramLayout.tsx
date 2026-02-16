'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'

interface InstagramLayoutProps {
  children: ReactNode
  showRightPanel?: boolean
}

export function InstagramLayout({ children, showRightPanel = true }: InstagramLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex max-w-[1200px] mx-auto">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-8 py-8">
          {children}
        </main>

        {/* Right Panel */}
        {showRightPanel && (
          <aside className="hidden xl:block w-80 py-8 pr-4">
            <div className="sticky top-8">
              <RightPanel />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
