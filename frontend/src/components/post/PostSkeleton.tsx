export interface PostSkeletonProps {
  count?: number
}

export function PostSkeleton({ count = 3 }: PostSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white mb-4 rounded-lg animate-pulse"
          style={{ border: '1px solid #E5E7EB' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-3">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: '#E5E7EB' }}
            />
            <div className="flex-1 space-y-2">
              <div 
                className="h-3 rounded"
                style={{ backgroundColor: '#E5E7EB', width: '120px' }}
              />
              <div 
                className="h-2 rounded"
                style={{ backgroundColor: '#E5E7EB', width: '80px' }}
              />
            </div>
          </div>

          {/* Image placeholder */}
          <div 
            className="w-full"
            style={{ 
              backgroundColor: '#E5E7EB',
              height: '400px'
            }}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-4 px-3 pt-2">
            <div 
              className="w-7 h-7 rounded"
              style={{ backgroundColor: '#E5E7EB' }}
            />
            <div 
              className="w-7 h-7 rounded"
              style={{ backgroundColor: '#E5E7EB' }}
            />
            <div 
              className="w-7 h-7 rounded"
              style={{ backgroundColor: '#E5E7EB' }}
            />
          </div>

          {/* Content */}
          <div className="px-3 py-3 space-y-2">
            <div 
              className="h-3 rounded"
              style={{ backgroundColor: '#E5E7EB', width: '60%' }}
            />
            <div 
              className="h-3 rounded"
              style={{ backgroundColor: '#E5E7EB', width: '90%' }}
            />
            <div 
              className="h-3 rounded"
              style={{ backgroundColor: '#E5E7EB', width: '75%' }}
            />
          </div>

          {/* Comment input */}
          <div 
            className="px-3 py-2.5"
            style={{ borderTop: '1px solid #E5E7EB' }}
          >
            <div 
              className="h-4 rounded"
              style={{ backgroundColor: '#E5E7EB', width: '150px' }}
            />
          </div>
        </div>
      ))}
    </>
  )
}
