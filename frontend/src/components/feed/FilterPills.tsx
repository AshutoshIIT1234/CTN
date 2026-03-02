'use client'

import { Flame, Sparkles, MessageSquare, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export type FilterType = 'latest' | 'trending' | 'debate'

interface FilterPillsProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  className?: string
}

const filters: {
  id: FilterType
  label: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  activeShadow: string
}[] = [
  {
    id: 'latest',
    label: 'Latest',
    icon: Sparkles,
    activeStyle: { background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' },
    activeShadow: '0 4px 14px rgba(59,130,246,0.45)',
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: TrendingUp,
    activeStyle: { background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
    activeShadow: '0 4px 14px rgba(249,115,22,0.45)',
  },
  {
    id: 'debate',
    label: 'Debate',
    icon: MessageSquare,
    activeStyle: { background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)' },
    activeShadow: '0 4px 14px rgba(139,92,246,0.45)',
  },
]

export function FilterPills({
  activeFilter,
  onFilterChange,
  className = '',
}: FilterPillsProps) {
  return (
    <div
      className={`sticky top-0 z-30 border-b border-slate-100 dark:border-dark-800 filter-pills-bar ${className}`}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div
        className="flex items-center gap-2 overflow-x-auto pills-scroll"
        style={{
          padding: '10px 16px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {filters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              aria-pressed={isActive}
              style={{
                flexShrink: 0,
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                minHeight: 40,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                background: 'transparent',
              }}
            >
              {/*
                Shared layout pill — rendered for EVERY button but only
                visible (via opacity) for the active one.
                Framer Motion keeps the element alive during transition so
                there is zero flash between states.
              */}
              <motion.span
                layoutId="filterActivePill"
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 0.88,
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.38 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  pointerEvents: 'none',
                  boxShadow: isActive ? filter.activeShadow : 'none',
                  ...filter.activeStyle,
                }}
              />

              {/* Hover tint for inactive pills (desktop) */}
              {!isActive && (
                <span
                  className="hover-tint"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    background: 'rgba(241,245,249,0)',
                    transition: 'background 0.18s ease',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Icon */}
              <Icon
                style={{
                  width: 15,
                  height: 15,
                  strokeWidth: 2.5,
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                  color: isActive ? '#ffffff' : '#94A3B8',
                  transition: 'color 0.2s ease',
                }}
              />

              {/* Label */}
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontWeight: 900,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  color: isActive ? '#ffffff' : '#64748B',
                  transition: 'color 0.2s ease',
                }}
              >
                {filter.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Global styles for this component */}
      <style>{`
        .filter-pills-bar {
          background: rgba(255, 255, 255, 0.92);
        }
        .dark .filter-pills-bar {
          background: rgba(10, 15, 36, 0.92);
        }
        .filter-pills-bar .pills-scroll::-webkit-scrollbar {
          display: none;
        }
        /* Hover tint on inactive pills (desktop only) */
        .filter-pills-bar button:hover .hover-tint {
          background: rgba(241, 245, 249, 1) !important;
        }
        .dark .filter-pills-bar button:hover .hover-tint {
          background: rgba(255, 255, 255, 0.06) !important;
        }
      `}</style>
    </div>
  )
}
