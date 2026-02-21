'use client'

import { Grid, Bookmark, Tag } from 'lucide-react'

type TabType = 'posts' | 'saved' | 'tagged'

interface ContentTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  showSaved?: boolean
}

export function ContentTabs({ activeTab, onTabChange, showSaved = true }: ContentTabsProps) {
  const allTabs = [
    { id: 'posts' as TabType, label: 'POSTS', icon: Grid },
    { id: 'saved' as TabType, label: 'SAVED', icon: Bookmark },
    { id: 'tagged' as TabType, label: 'TAGGED', icon: Tag },
  ]

  const tabs = showSaved ? allTabs : allTabs.filter(tab => tab.id !== 'saved')

  return (
    <div className="border-t border-gray-200">
      <div className="flex justify-center gap-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 py-3.5 px-1 border-t -mt-px font-semibold text-xs tracking-[0.1em] transition-all duration-200 ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
