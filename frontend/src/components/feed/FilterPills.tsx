'use client'

import { Flame, TrendingUp, MessageSquare, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export type FilterType = 'latest' | 'trending' | 'debate'

interface FilterPillsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  const filters: { id: FilterType; label: string; icon: any }[] = [
    { id: 'latest', label: 'Fresh Intel', icon: Sparkles },
    { id: 'trending', label: 'Viral Logic', icon: Flame },
    { id: 'debate', label: 'Hot Debates', icon: MessageSquare },
  ]

  return (
    <div className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-800">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar scroll-smooth">
        {filters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className="relative group flex items-center gap-2.5 px-6 py-2.5 rounded-2xl transition-all duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="activeFilterBg"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200/50 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <Icon
                className={`w-4 h-4 relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'
                  }`}
              />
              <span
                className={`text-[13px] font-black relative z-10 uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
              >
                {filter.label}
              </span>

              {!isActive && (
                <div className="absolute inset-0 bg-slate-50 dark:bg-dark-800 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

