'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, Brain, Eye, EyeOff, AlertCircle, CheckCircle2,
  ArrowRight, Sparkles, User, Mail, Shield, Building2,
  Globe, GraduationCap, ChevronDown, Search
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'

interface College {
  id: string
  name: string
  emailDomain: string
  logoUrl?: string
}

type UserType = 'GENERAL' | 'COLLEGE'

export default function RegisterPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { setUser, setToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [userType, setUserType] = useState<UserType>('GENERAL')
  const [colleges, setColleges] = useState<College[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await api.get('/colleges')
        setColleges(response.data)
      } catch (err) {
        console.error('Failed to fetch colleges', err)
      }
    }
    fetchColleges()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Key validation mismatch')
      return
    }

    if (userType === 'COLLEGE' && !selectedCollege) {
      setError('Please select your institution')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password
      })

      if (response.data.requiresVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        setUser(response.data.user)
        setToken(response.data.token)
        router.push('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identity established failure. Try again.')
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

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isFormValid = formData.email && formData.username &&
    formData.password && formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    (userType === 'GENERAL' || selectedCollege)

  const passwordsMatch = formData.password && formData.confirmPassword &&
    formData.password === formData.confirmPassword

  const emailMatchesCollege = userType === 'COLLEGE' && selectedCollege &&
    formData.email.endsWith(`@${selectedCollege.emailDomain}`)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 md:p-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: theme === 'dark' ? 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)' : 'radial-gradient(circle at 2px 2px, #0f172a 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[600px] relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block relative"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[30px] flex items-center justify-center shadow-2xl relative z-10">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
          </motion.div>
          <h1 className="mt-6 text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Establish Identity
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            The Critical Thinking Network
          </p>
        </div>

        {/* User Type Switcher */}
        <div className="flex p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-white/10 rounded-[28px] mb-8 relative shadow-xl shadow-slate-200/50 dark:shadow-none">
          <motion.div
            layoutId="typeHighlight"
            className="absolute inset-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[22px] shadow-lg"
            animate={{ x: userType === 'GENERAL' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setUserType('GENERAL')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] relative z-10 transition-colors duration-300 ${userType === 'GENERAL' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-black uppercase tracking-wider">Global Thinker</span>
          </button>
          <button
            onClick={() => setUserType('COLLEGE')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] relative z-10 transition-colors duration-300 ${userType === 'COLLEGE' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-black uppercase tracking-wider">Scholar</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[44px] p-8 md:p-10 shadow-3xl overflow-visible relative">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400 font-bold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {userType === 'COLLEGE' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 relative"
                >
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> Select Institution
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                      className="w-full px-6 py-4.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-between text-left hover:bg-white dark:hover:bg-white/10 transition-all group"
                    >
                      <span className={`font-bold ${selectedCollege ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                        {selectedCollege ? selectedCollege.name : 'Search for your college...'}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${showCollegeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCollegeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-3xl shadow-3xl z-50 backdrop-blur-2xl">
                        <div className="relative mb-3">
                          <input
                            type="text"
                            placeholder="Type to filter..."
                            className="w-full px-10 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[20px] text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar space-y-2 pb-2">
                          {filteredColleges.length > 0 ? (
                            <>
                              {/* Hero / Premier Institutions Section */}
                              {searchQuery === '' && (
                                <div className="px-4 py-3 mb-2 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Premier Institutions</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1">
                                    {colleges.filter(c => c.name.includes('IIT') || c.name.includes('IIM') || c.name.includes('AIIMS') || c.name.includes('NIT') || c.name.includes('IIIT')).slice(0, 5).map(college => (
                                      <button
                                        key={college.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCollege(college)
                                          setShowCollegeDropdown(false)
                                          setError('')
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-600/20 text-slate-400 hover:text-white transition-all text-left group/item"
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-black text-xs text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                                          {college.name.includes('IIT') ? 'IIT' : college.name.includes('IIM') ? 'IIM' : college.name.includes('AIIMS') ? 'MED' : 'TECH'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-bold text-[13px] truncate">{college.name}</div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                {searchQuery ? 'Search Results' : 'All Institutions'}
                              </div>

                              {filteredColleges.map((college) => (
                                <button
                                  key={college.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCollege(college)
                                    setShowCollegeDropdown(false)
                                    setError('')
                                  }}
                                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-600/20 text-slate-300 hover:text-white transition-all text-left group"
                                >
                                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-blue-500/50 transition-all">
                                    {college.logoUrl ? (
                                      <img src={college.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                                    ) : (
                                      <span className="font-black text-xl text-blue-500">{college.name[0]}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate flex items-center gap-2">
                                      {college.name}
                                      {(college.name.includes('IIT') || college.name.includes('IIM') || college.name.includes('AIIMS')) && (
                                        <Shield className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">DOMAIN: {college.emailDomain}</div>
                                  </div>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="p-12 text-center text-slate-500 space-y-4">
                              <Building2 className="w-12 h-12 mx-auto opacity-20" />
                              <div className="font-bold text-sm tracking-widest uppercase">No node found in registry</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedCollege && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                    >
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        Required Domain: @{selectedCollege.emailDomain}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Public Alias
                </label>
                <div className="relative group">
                  <input
                    name="username"
                    type="text"
                    placeholder="thinkerX"
                    className="w-full px-6 py-4.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 outline-none"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email Node
                </label>
                <div className="relative group">
                  <input
                    name="email"
                    type="email"
                    placeholder={userType === 'COLLEGE' && selectedCollege ? `you@${selectedCollege.emailDomain}` : "name@domain.com"}
                    className={`w-full px-6 py-4.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 outline-none ${userType === 'COLLEGE' && formData.email && !emailMatchesCollege ? 'ring-2 ring-amber-500/50' : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Access Key
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-6 py-4.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 pr-14 outline-none"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors rounded-xl"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Verify Key
                </label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full px-6 py-4.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 outline-none ${formData.confirmPassword && !passwordsMatch ? 'ring-2 ring-red-500/50' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  {formData.confirmPassword && passwordsMatch && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in duration-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${isLoading || !isFormValid
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>Decrypt Profile</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
                  </>
                )}

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              </button>
            </div>
          </form>

          {/* Institutional Navigation */}
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-center text-slate-500 text-sm font-bold">
              Already a node member?{' '}
              <Link
                href="/auth/login"
                className="text-blue-500 hover:text-blue-400 font-black ml-1 transition-colors uppercase tracking-widest text-xs"
              >
                Enter HUB
              </Link>
            </p>
          </div>
        </div>

        {/* Global Footer */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">
            <span>Secured Node</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span>Encrypted Ledger</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span>Open Discourse</span>
          </div>
          <p className="text-slate-400 dark:text-[#1E293B] text-[10px] font-black tracking-widest">
            &copy; MMXXIV CRITICAL THINKERS NETWORK
          </p>
        </div>
      </motion.div>
    </div>
  )
}
