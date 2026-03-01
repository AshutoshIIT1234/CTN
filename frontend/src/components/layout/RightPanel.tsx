'use client'

import { TrendingUp, Users, Award, ArrowRight, Zap, Target } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function RightPanel() {
  const topThinkers = [
    { name: 'Ayush Sharma', college: 'IIM Jammu', posts: 45, color: 'from-blue-500 to-cyan-500' },
    { name: 'Priya Singh', college: 'IIT Delhi', posts: 38, color: 'from-purple-500 to-pink-500' },
    { name: 'Rahul Verma', college: 'XLRI', posts: 32, color: 'from-orange-500 to-amber-500' },
  ]

  const trendingTopics = [
    { topic: 'AI in Education', posts: 234, growth: '+12%' },
    { topic: 'Climate Policy', posts: 189, growth: '+5%' },
    { topic: 'Startup Culture', posts: 156, growth: '+22%' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-[320px] py-8 space-y-8 sticky top-0 h-screen overflow-y-auto hide-scrollbar"
    >
      {/* Network Pulse Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-dark-900 rounded-[32px] p-6 border border-gray-100 dark:border-dark-800 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap className="w-12 h-12 text-blue-600" />
        </div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest">Network Pulse</h3>
        </div>
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Live Minds</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">247</h4>
            </div>
            <div className="h-2 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                className="h-full bg-blue-600"
              />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Daily Thesis</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">1.2K</h4>
            </div>
            <div className="h-2 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                className="h-full bg-indigo-600"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Intellectuals Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-dark-900 rounded-[32px] p-6 border border-gray-100 dark:border-dark-800 shadow-xl shadow-slate-200/40"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest">Top Minds</h3>
          </div>
          <Link href="/rankings" className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase hover:underline">Leaderboard</Link>
        </div>
        <div className="space-y-4">
          {topThinkers.map((thinker, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
            >
              <Link
                href={`/profile/${thinker.name.toLowerCase().replace(' ', '-')}`}
                className="flex items-center gap-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${thinker.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:rotate-6 transition-transform`}>
                  <span className="text-white text-lg font-black">{thinker.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 dark:text-white truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {thinker.name}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate tracking-tight lowercase">
                    @{thinker.college.replace(' ', '').toLowerCase()}
                  </div>
                </div>
                <div className="text-[10px] font-black bg-slate-50 dark:bg-dark-800 px-2 py-1 rounded-lg text-slate-500">
                  {thinker.posts}P
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trending Discourses Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-dark-900 rounded-[32px] p-6 border border-gray-100 dark:border-dark-800 shadow-xl shadow-slate-200/40"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-widest">Hot Discourse</h3>
        </div>
        <div className="space-y-1">
          {trendingTopics.map((topic, index) => (
            <Link
              key={index}
              href={`/trending?topic=${encodeURIComponent(topic.topic)}`}
              className="group block p-3 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-dark-800"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  #{topic.topic.replace(' ', '')}
                </span>
                <span className="text-[10px] font-black text-green-500">{topic.growth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 transition-opacity">
                  {topic.posts} active thoughts
                </span>
                <ArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Minimal Footer */}
      <div className="px-6 space-y-4">
        <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Link href="/about" className="hover:text-blue-600 transition-colors">Philosophy</Link>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">Manifesto</Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">Liberty</Link>
          <Link href="/help" className="hover:text-blue-600 transition-colors">Codex</Link>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-50 dark:border-dark-800 pt-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intellectual Infrastructure Active</span>
        </div>
      </div>
    </motion.div>
  )
}

