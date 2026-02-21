'use client'

import { Flame, TrendingUp, MessageSquare } from 'lucide-react'

export type FilterType = 'latest' | 'trending' | 'debate'

interface FilterPillsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  const filters: { id: FilterType; label: string; icon: React.ElementType }[] = [
    { id: 'latest', label: 'Latest', icon: Flame },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'debate', label: 'Debate', icon: MessageSquare },
  ]

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #E5E7EB' }}>
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: isActive ? '#3B82F6' : 'white',
              color: isActive ? 'white' : '#111827',
              border: isActive ? 'none' : '1px solid #E5E7EB',
              boxShadow: isActive 
                ? '0 4px 6px rgba(0, 0, 0, 0.1)' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Icon className="w-4 h-4" />
            <span>{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}
