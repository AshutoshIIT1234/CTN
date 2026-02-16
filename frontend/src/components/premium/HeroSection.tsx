'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const scrollToFeed = () => {
    const feedElement = document.getElementById('national-feed')
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-royal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-navy-200">India's Premier Intellectual Network</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
            >
              <span className="text-gradient">Think Critically.</span>
              <br />
              <span className="text-navy-50">Debate Nationally.</span>
              <br />
              <span className="text-gradient-royal">Grow Academically.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-navy-300 mb-8 leading-relaxed max-w-2xl"
            >
              India's first structured intellectual network for students. Engage in meaningful discourse, access premium resources, and connect with brilliant minds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={scrollToFeed}
                className="btn-primary group"
              >
                Explore Discussions
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/auth/register"
                className="btn-secondary"
              >
                Join the Network
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gradient mb-1">500+</div>
                <div className="text-sm text-navy-400">Active Thinkers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gradient mb-1">50+</div>
                <div className="text-sm text-navy-400">Top Colleges</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gradient mb-1">1000+</div>
                <div className="text-sm text-navy-400">Discussions</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main Card */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-card p-6 rounded-2xl mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-400 to-primary-400" />
                  <div>
                    <div className="h-3 w-32 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-24 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/20 rounded" />
                  <div className="h-3 w-5/6 bg-white/20 rounded" />
                  <div className="h-3 w-4/6 bg-white/20 rounded" />
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-navy-300">124</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-royal-400" />
                    <span className="text-sm text-navy-300">36</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-6 -right-6 glass-card p-4 rounded-xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-royal-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl"
              >
                <div className="text-2xl font-bold text-gradient">🏛️</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary-500/50 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-primary-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
