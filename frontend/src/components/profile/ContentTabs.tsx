'use client'

import { Grid, Bookmark, Tag, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

type TabType = 'posts' | 'saved' | 'tagged'

interface ContentTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  showSaved?: boolean
}

export function ContentTabs({ activeTab, onTabChange, showSaved = true }: ContentTabsProps) {
  const allTabs = [
    { id: 'posts' as TabType, label: 'Intellectual Theses', icon: Grid },
    { id: 'saved' as TabType, label: 'Archived Logic', icon: Bookmark },
    { id: 'tagged' as TabType, label: 'Tagged Mentions', icon: Tag },
  ]

  const tabs = showSaved ? allTabs : allTabs.filter(tab => tab.id !== 'saved')

  return (
    <div className="border-t border-slate-50 dark:border-dark-800">
      <div className="flex justify-center gap-1 md:gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative py-6 px-4 group flex items-center gap-2.5 outline-none transition-all"
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50 dark:bg-dark-800 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>

              <span
                className={`text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-b-full shadow-lg shadow-blue-200/50"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

