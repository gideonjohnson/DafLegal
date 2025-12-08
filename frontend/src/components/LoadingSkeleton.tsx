'use client'

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen leather-bg">
      {/* Navigation Skeleton */}
      <div className="nav-leather sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#d4a561]/20 animate-pulse" />
              <div className="h-4 w-24 bg-[#d4a561]/20 rounded animate-pulse" />
            </div>
            <div className="hidden lg:flex items-center gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-[#d4a561]/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 w-3/4 mx-auto bg-[#d4a561]/10 rounded-lg mb-4 animate-pulse" />
            <div className="h-6 w-1/2 mx-auto bg-[#d4a561]/10 rounded-lg mb-8 animate-pulse" />
            <div className="flex justify-center gap-4">
              <div className="h-12 w-40 bg-[#d4a561]/20 rounded-lg animate-pulse" />
              <div className="h-12 w-40 bg-[#d4a561]/10 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-beige p-6 animate-pulse">
                <div className="w-12 h-12 bg-[#d4a561]/20 rounded-lg mb-4" />
                <div className="h-6 w-3/4 bg-[#d4a561]/10 rounded mb-3" />
                <div className="h-4 w-full bg-[#d4a561]/10 rounded mb-2" />
                <div className="h-4 w-5/6 bg-[#d4a561]/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
