export interface PostSkeletonProps {
  count?: number
}

function SkeletonCard() {
  return (
    <div className="feed-card mb-3 md:mb-6 md:rounded-[32px] overflow-hidden">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] skeleton flex-shrink-0" />

          {/* Name + meta */}
          <div className="space-y-2">
            <div className="h-3.5 w-28 rounded-lg skeleton" />
            <div className="h-2.5 w-20 rounded-lg skeleton" />
          </div>
        </div>

        {/* More button */}
        <div className="w-9 h-9 rounded-xl skeleton" />
      </div>

      {/* ── Title ──────────────────────────────────────── */}
      <div className="px-4 md:px-6 mb-2 space-y-2">
        <div className="h-4 w-3/4 rounded-lg skeleton" />
      </div>

      {/* ── Body lines ─────────────────────────────────── */}
      <div className="px-4 md:px-6 pb-4 space-y-2.5">
        <div className="h-3 w-full rounded-lg skeleton" />
        <div className="h-3 w-[90%] rounded-lg skeleton" />
        <div className="h-3 w-[75%] rounded-lg skeleton" />
        <div className="h-3 w-[60%] rounded-lg skeleton" />
      </div>

      {/* ── Action row ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 border-t border-slate-50 dark:border-dark-800">
        <div className="flex items-center gap-1">
          <div className="w-10 h-9 rounded-xl skeleton" />
          <div className="w-10 h-9 rounded-xl skeleton" />
          <div className="w-10 h-9 rounded-xl skeleton" />
        </div>
        <div className="w-10 h-9 rounded-xl skeleton" />
      </div>
    </div>
  )
}

export function PostSkeleton({ count = 3 }: PostSkeletonProps) {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
