'use client'

import { TrendingUp, Users, Award } from 'lucide-react'
import Link from 'next/link'

export function RightPanel() {
  const topThinkers = [
    { name: 'Ayush Sharma', college: 'IIM Jammu', posts: 45 },
    { name: 'Priya Singh', college: 'IIT Delhi', posts: 38 },
    { name: 'Rahul Verma', college: 'XLRI', posts: 32 },
  ]

  const trendingTopics = [
    { topic: 'AI in Education', posts: 234 },
    { topic: 'Climate Policy', posts: 189 },
    { topic: 'Startup Culture', posts: 156 },
  ]

  return (
    <div className="w-[320px] p-4 space-y-4">
      {/* Active Now Card */}
      <div 
        className="bg-white rounded-lg p-4"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
          <h3 className="font-semibold" style={{ color: '#111827' }}>Active Now</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#6B7280' }}>Online Users</span>
            <span className="text-lg font-bold" style={{ color: '#3B82F6' }}>247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#6B7280' }}>Today's Discussions</span>
            <span className="text-lg font-bold" style={{ color: '#3B82F6' }}>1.2K</span>
          </div>
        </div>
      </div>

      {/* Top Thinkers Card */}
      <div 
        className="bg-white rounded-lg p-4"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5" style={{ color: '#3B82F6' }} />
          <h3 className="font-semibold" style={{ color: '#111827' }}>Top Thinkers</h3>
        </div>
        <div className="space-y-3">
          {topThinkers.map((thinker, index) => (
            <Link
              key={index}
              href={`/profile/${thinker.name}`}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-50"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
              >
                <span className="text-white text-sm font-semibold">
                  {thinker.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                  {thinker.name}
                </div>
                <div className="text-xs truncate" style={{ color: '#6B7280' }}>
                  {thinker.college}
                </div>
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF', fontWeight: 300 }}>
                {thinker.posts} posts
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Topics Card */}
      <div 
        className="bg-white rounded-lg p-4"
        style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" style={{ color: '#F97316' }} />
          <h3 className="font-semibold" style={{ color: '#111827' }}>Trending Topics</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <Link
              key={index}
              href={`/trending?topic=${encodeURIComponent(topic.topic)}`}
              className="block p-2 rounded-lg transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                  {topic.topic}
                </span>
              </div>
              <div className="text-xs ml-8" style={{ color: '#6B7280' }}>
                {topic.posts} discussions
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-xs space-y-2 px-2" style={{ color: '#6B7280' }}>
        <div className="flex flex-wrap gap-2">
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link href="/help" className="hover:underline">Help</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
        <div style={{ color: '#9CA3AF' }}>
          © 2026 CTN. All rights reserved.
        </div>
      </div>
    </div>
  )
}
