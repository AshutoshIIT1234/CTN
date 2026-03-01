'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Brain, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, ShieldCheck, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { setUser, setToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })

      setUser(response.data.user)
      setToken(response.data.token)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials in the network.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-500">
      {/* Royal Background Effects */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: theme === 'dark' ? 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)' : 'radial-gradient(circle at 2px 2px, #0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] relative z-10"
      >
        {/* Modern Branding */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block relative"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl relative z-10">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
          </motion.div>
          <h1 className="mt-8 text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Auth Access
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            Critical Thinking Network Portal
          </p>
        </div>

        {/* Premium Login Card */}
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[44px] p-8 md:p-12 shadow-3xl overflow-hidden relative group">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400 font-bold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Security Identity
              </label>
              <div className="relative group/input">
                <input
                  name="email"
                  type="email"
                  placeholder="name@ctn.edu"
                  className="w-full px-7 py-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 outline-none"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 dark:text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Access Key
                </label>
                <Link
                  href="#"
                  className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                >
                  Recover Key
                </Link>
              </div>
              <div className="relative group/input">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-7 py-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 pr-16 outline-none"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors rounded-xl"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${isLoading || !formData.email || !formData.password
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>Decrypt Access</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
                  </>
                )}

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              </button>
            </div>
          </form>

          {/* Alternative Auth */}
          <div className="mt-12 pt-10 border-t border-white/5">
            <p className="text-center text-slate-500 text-sm font-bold">
              New to the Network?{' '}
              <Link
                href="/auth/register"
                className="text-blue-500 hover:text-blue-400 font-black ml-1 transition-colors uppercase tracking-widest text-xs"
              >
                Establish Profile
              </Link>
            </p>
          </div>
        </div>

        {/* Global Footer */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">
            <span>Encrypted Node</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span>Institutional Access</span>
          </div>
          <p className="text-slate-400 dark:text-[#1E293B] text-[10px] font-black">
            &copy; MMXXIV CRITICAL THINKERS NETWORK. ALL RIGHTS RESERVED.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
