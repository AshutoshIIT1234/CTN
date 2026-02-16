'use client'

import { TrendingUp, Users, Sparkles, Award } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Active Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-royal-600" />
          <h3 className="font-semibold text-gray-900">Active Now</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Online Users</span>
            <span className="text-lg font-bold text-royal-600">247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Today's Discussions</span>
            <span className="text-lg font-bold text-primary-600">1.2K</span>
          </div>
        </div>
      </div>

      {/* Top Thinkers */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Top Thinkers</h3>
        </div>
        <div className="space-y-3">
          {topThinkers.map((thinker, index) => (
            <Link
              key={index}
              href={`/profile/${thinker.name}`}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-400 to-primary-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {thinker.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {thinker.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {thinker.college}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {thinker.posts} posts
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Trending Topics</h3>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <Link
              key={index}
              href={`/trending?topic=${encodeURIComponent(topic.topic)}`}
              className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <span className="text-sm font-semibold text-gray-900">
                  {topic.topic}
                </span>
              </div>
              <div className="text-xs text-gray-500 ml-8">
                {topic.posts} discussions
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured College */}
      <div className="bg-gradient-to-br from-royal-50 to-primary-50 rounded-lg border border-royal-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-royal-600" />
          <h3 className="font-semibold text-gray-900">Featured College</h3>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🏛️</div>
          <div className="font-bold text-gray-900 mb-1">IIM Ahmedabad</div>
          <div className="text-sm text-gray-600 mb-3">
            Leading business school with 500+ active members
          </div>
          <Link
            href="/college/iim-ahmedabad"
            className="inline-block text-sm text-royal-600 hover:text-royal-700 font-semibold"
          >
            Explore →
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-xs text-gray-500 space-y-2 px-2">
        <div className="flex flex-wrap gap-2">
          <Link href="/about" className="hover:text-gray-700">About</Link>
          <span>·</span>
          <Link href="/help" className="hover:text-gray-700">Help</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-700">Terms</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
        </div>
        <div className="text-gray-400">
          © 2026 CTN. All rights reserved.
        </div>
      </div>
    </div>
  )
}
