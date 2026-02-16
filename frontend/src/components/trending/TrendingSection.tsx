'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Hash, Users, BookOpen, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface TrendingTopic {
  id: string
  name: string
  category: string
  postCount: number
  trend: 'up' | 'down' | 'stable'
  description?: string
}

interface TrendingUser {
  id: string
  username: string
  displayName: string
  avatar: string
  followerCount: number
  isVerified?: boolean
}

export function TrendingSection() {
  const [trendingTopics] = useState<TrendingTopic[]>([
    {
      id: '1',
      name: 'Critical Thinking',
      category: 'Education',
      postCount: 12500,
      trend: 'up',
      description: 'Discussions about analytical reasoning and logical thinking'
    },
    {
      id: '2',
      name: 'Academic Resources',
      category: 'Education',
      postCount: 8234,
      trend: 'up',
      description: 'Sharing and discovering educational materials'
    },
    {
      id: '3',
      name: 'College Discussion',
      category: 'Education',
      postCount: 5678,
      trend: 'stable',
      description: 'Campus life and academic experiences'
    },
    {
      id: '4',
      name: 'Philosophy',
      category: 'Philosophy',
      postCount: 4321,
      trend: 'up',
      description: 'Exploring fundamental questions about existence and knowledge'
    },
    {
      id: '5',
      name: 'AI in Education',
      category: 'Technology',
      postCount: 2987,
      trend: 'up',
      description: 'The impact of artificial intelligence on learning'
    },
    {
      id: '6',
      name: 'Ethics & Morality',
      category: 'Philosophy',
      postCount: 2456,
      trend: 'stable',
      description: 'Moral philosophy and ethical dilemmas'
    }
  ])

  const [suggestedUsers] = useState<TrendingUser[]>([
    {
      id: '1',
      username: 'eduhub',
      displayName: 'Education Hub',
      avatar: 'ED',
      followerCount: 15420,
      isVerified: true
    },
    {
      id: '2',
      username: 'philtoday',
      displayName: 'Philosophy Today',
      avatar: 'PH',
      followerCount: 12350,
      isVerified: true
    },
    {
      id: '3',
      username: 'criticalthink',
      displayName: 'Critical Thinkers',
      avatar: 'CT',
      followerCount: 9876,
      isVerified: false
    },
    {
      id: '4',
      username: 'academiclife',
      displayName: 'Academic Life',
      avatar: 'AL',
      followerCount: 8765,
      isVerified: false
    }
  ])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      case 'stable':
        return <div className="w-4 h-4 bg-gray-500 rounded-full" />
    }
  }

  return (
    <div className="space-y-4">
      {/* What's Trending */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold">What's trending</h2>
        </div>
        
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/search?q=${encodeURIComponent(topic.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="block hover:bg-gray-800 p-3 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTrendIcon(topic.trend)}
                      <p className="text-gray-500 text-sm">
                        {topic.category} · Trending
                      </p>
                    </div>
                    <p className="font-bold text-white group-hover:text-primary-400 transition-colors">
                      {topic.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {formatNumber(topic.postCount)} posts
                    </p>
                    {topic.description && (
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <Link 
          href="/search" 
          className="block text-primary-400 hover:text-primary-300 text-sm mt-3 transition-colors"
        >
          Show more
        </Link>
      </motion.div>

      {/* Who to Follow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold">Who to follow</h2>
        </div>
        
        <div className="space-y-3">
          {suggestedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center justify-between hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user.avatar}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-white truncate">
                      {user.displayName}
                    </p>
                    {user.isVerified && (
                      <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                  <p className="text-gray-400 text-xs">
                    {formatNumber(user.followerCount)} followers
                  </p>
                </div>
              </Link>
              <button className="bg-white text-black font-bold py-1.5 px-4 rounded-full text-sm hover:bg-gray-200 transition-colors flex-shrink-0">
                Follow
              </button>
            </motion.div>
          ))}
        </div>
        
        <Link 
          href="/search" 
          className="block text-primary-400 hover:text-primary-300 text-sm mt-3 transition-colors"
        >
          Show more
        </Link>
      </motion.div>

      {/* Topics to Follow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold">Topics to follow</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[
            'Philosophy', 'Ethics', 'Logic', 'Debate', 'Science', 
            'Psychology', 'Sociology', 'Politics', 'History', 'Literature'
          ].map((topic, index) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <Link 
                href={`/search?q=${topic.toLowerCase()}`}
                className="inline-block bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full text-sm transition-colors"
              >
                #{topic}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Discussions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold">Recent discussions</h2>
        </div>
        
        <div className="space-y-3">
          {[
            {
              title: "The role of AI in critical thinking education",
              replies: 42,
              time: "2h"
            },
            {
              title: "Should philosophy be mandatory in college?",
              replies: 38,
              time: "4h"
            },
            {
              title: "Ethical implications of social media algorithms",
              replies: 29,
              time: "6h"
            }
          ].map((discussion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Link 
                href={`/search?q=${encodeURIComponent(discussion.title)}`}
                className="block hover:bg-gray-800 p-2 rounded-lg cursor-pointer transition-colors"
              >
                <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                  {discussion.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{discussion.replies} replies</span>
                  <span>·</span>
                  <span>{discussion.time} ago</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}