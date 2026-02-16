export function PostSkeleton() {
  return (
    <div className="border-b border-gray-800 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-800" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 bg-gray-800 rounded w-24" />
            <div className="h-4 bg-gray-800 rounded w-20" />
            <div className="h-4 bg-gray-800 rounded w-16" />
          </div>

          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-4/5" />
            <div className="h-4 bg-gray-800 rounded w-3/4" />
          </div>

          <div className="flex items-center justify-between max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="h-4 bg-gray-800 rounded w-8" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="h-4 bg-gray-800 rounded w-8" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full" />
              <div className="h-4 bg-gray-800 rounded w-8" />
            </div>
            <div className="w-8 h-8 bg-gray-800 rounded-full" />
            <div className="w-8 h-8 bg-gray-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
