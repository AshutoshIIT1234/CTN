'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Hash, Users, BookOpen, MessageCircle, ShieldCheck } from 'lucide-react'
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
        className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Signals</h2>
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
                className="block hover:bg-slate-50 dark:hover:bg-dark-800 p-4 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getTrendIcon(topic.trend)}
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        {topic.category} · Active
                      </p>
                    </div>
                    <p className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                      {topic.name}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
                      {formatNumber(topic.postCount)} discussions
                    </p>
                    {topic.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
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
          href="/trending"
          className="block text-center text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mt-6 hover:translate-x-1 transition-transform"
        >
          View National Grid →
        </Link>
      </motion.div>

      {/* Who to Follow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Peers</h2>
        </div>

        <div className="space-y-3">
          {suggestedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-800 p-3 rounded-2xl transition-all group"
            >
              <Link href={`/profile/${user.id}`} className="flex items-center gap-4 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-dark-800 dark:to-dark-700 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-dark-900 shadow-sm p-0.5 overflow-hidden">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-dark-900 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-sm">
                    {user.avatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-slate-900 dark:text-white truncate tracking-tight">
                      {user.displayName}
                    </p>
                    {user.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold truncate tracking-tight">@{user.username}</p>
                  <p className="text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">
                    {formatNumber(user.followerCount)} Nodes
                  </p>
                </div>
              </Link>
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-2 px-5 rounded-xl text-[11px] uppercase tracking-widest hover:scale-105 transition-all flex-shrink-0 shadow-lg shadow-slate-200/50 dark:shadow-none">
                Link
              </button>
            </motion.div>
          ))}
        </div>

        <Link
          href="/trending"
          className="block text-center text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mt-6 hover:translate-x-1 transition-transform"
        >
          View National Grid →
        </Link>
      </motion.div>

      {/* Topics to Follow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Domains</h2>
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
                className="inline-block bg-slate-50 dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-slate-100 dark:border-dark-700"
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
        className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-xl">
            <MessageCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Discourse</h2>
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
                className="block hover:bg-slate-50 dark:hover:bg-dark-800 p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <p className="text-slate-900 dark:text-white text-sm font-bold line-clamp-2 mb-2 leading-snug group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {discussion.title}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span>{discussion.replies} Signal Threads</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-dark-700" />
                  <span>{discussion.time} Relative</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}