'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Lock, Palette, Shield, Save, LogOut, Check, ChevronRight, Crown, Globe, Zap, ShieldCheck, ArrowRight, Save as SaveIcon, Activity, Sun, Moon, Monitor, Sparkles, AlertCircle, Settings as SettingsIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import api from '@/lib/api'

export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setBio(user.bio || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await api.put(`/users/${user?.id}/profile`, { displayName, bio })
      setUser({ ...user!, displayName, bio })
      setMessage({ type: 'success', text: 'Identity synchronized successfully.' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Synchronization failed.' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'premium', label: 'Premium Hub', icon: Crown, highlight: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <InstagramLayout>
      <div className="max-w-[1000px] mx-auto py-12 px-6 lg:px-12 bg-white dark:bg-dark-900 border-x border-slate-50 dark:border-dark-800 shadow-2xl min-h-screen">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-[28px] shadow-2xl flex items-center gap-3 backdrop-blur-3xl border ${message.type === 'success' ? 'bg-blue-600/95 border-blue-400/30' : 'bg-red-600/95 border-red-400/30'
                } text-white font-black text-xs uppercase tracking-widest`}
            >
              <div className="p-1 bg-white/20 rounded-lg">
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-16">
          {/* Header Section */}
          <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 shadow-lg shadow-blue-500/20 rounded-xl">
                    <SettingsIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Module Overview</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Settings <span className="text-blue-600">Portal</span></h1>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 bg-slate-50 dark:bg-dark-950/50 p-4 rounded-[32px] border border-slate-100 dark:border-dark-800 shadow-sm"
              >
                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="pr-6">
                  <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1">{user.displayName || user.username}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Manifest ID: {user.id.slice(0, 8)}</p>
                </div>
              </motion.div>
            </div>

            {/* Horizontal Tabs List */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-8 py-5 rounded-[24px] transition-all whitespace-nowrap border-2 snap-center group relative overflow-hidden ${isActive
                        ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 shadow-2xl scale-105'
                        : 'bg-white border-slate-100 dark:bg-dark-950 dark:border-dark-800 text-slate-400 hover:border-blue-500/20 hover:text-blue-600'
                      }`}
                  >
                    {isActive && (
                      <motion.div layoutId="tab-glow" className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-50" />
                    )}
                    <Icon className={`w-4 h-4 relative z-10 ${isActive ? '' : tab.highlight ? 'text-amber-500 group-hover:scale-110 transition-transform' : ''}`} />
                    <span className="font-black text-[11px] uppercase tracking-widest relative z-10">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content Section */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 opacity-[0.03] pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Public Metadata</h2>
                  <div className="h-1.5 w-20 bg-blue-600 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Entity Alias</label>
                    <input
                      className="w-full px-8 py-6 bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-dark-900 rounded-[28px] transition-all font-bold text-slate-900 dark:text-white shadow-inner"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Establish your name..."
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Universal Handle</label>
                    <div className="w-full px-8 py-6 bg-slate-100 dark:bg-dark-950/50 border-2 border-transparent rounded-[28px] font-black text-slate-500 lowercase flex items-center gap-2">
                      <span className="text-blue-600 opacity-50">@</span>
                      {user.username}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Biographical Cipher</label>
                  <textarea
                    className="w-full px-8 py-7 bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-dark-900 rounded-[32px] transition-all font-medium text-slate-700 dark:text-slate-300 h-48 resize-none leading-relaxed shadow-inner"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your footprint..."
                  />
                </div>

                <div className="pt-8 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-4 px-14 py-6 bg-blue-600 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all"
                  >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : <SaveIcon className="w-5 h-5" />}
                    Synchronize Portal
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === 'premium' && (
              <div className="space-y-12">
                <div className="space-y-4 text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-amber-400/10 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-8 h-8 text-amber-500 fill-current" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Elevate Your Existence</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Unlock absolute network sovereignty.</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[48px] p-12 lg:p-20 text-white relative overflow-hidden shadow-3xl border border-white/5">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {[
                        { icon: Globe, title: 'Global Decryption', desc: 'Total access to all national knowledge nodes.' },
                        { icon: Zap, title: 'Neural Speed', desc: 'Highest priority routing on all data transmissions.' },
                        { icon: ShieldCheck, title: 'Legacy Shield', desc: 'Exclusive Golden Badge recognizable network-wide.' },
                        { icon: Crown, title: 'Sovereign Status', desc: 'Full administrative rights to intellectual property.' },
                      ].map((feature, i) => (
                        <div key={i} className="flex gap-6 group/item">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover/item:scale-110 transition-transform">
                            <feature.icon className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-[16px] uppercase tracking-wide text-white">{feature.title}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-8 bg-white text-slate-900 rounded-[32px] font-black text-lg uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-6 group">
                      Acquire Premium Hub • ₹499/Year
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Optic calibration</h2>
                  <div className="h-1.5 w-20 bg-blue-600 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'light', label: 'Luminous', icon: Sun, color: 'bg-white border-slate-100 text-slate-900' },
                    { id: 'dark', label: 'Nocturnal', icon: Moon, color: 'bg-slate-950 border-white/5 text-white' },
                    { id: 'system', label: 'Autonomous', icon: Monitor, color: 'bg-gradient-to-br from-white to-slate-950 border-slate-100 text-slate-900' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id as any)}
                      className={`p-2 rounded-[44px] border-4 transition-all relative group shadow-sm ${theme === opt.id ? 'border-blue-600 scale-105 shadow-blue-500/20' : 'border-transparent'
                        }`}
                    >
                      <div className={`h-60 ${opt.color} rounded-[36px] flex flex-col items-center justify-center gap-5 relative overflow-hidden border shadow-inner`}>
                        <div className={`p-4 rounded-3xl ${theme === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5'}`}>
                          <opt.icon className="w-10 h-10" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{opt.label}</span>
                        {theme === opt.id && (
                          <div className="absolute top-6 right-6 bg-blue-600 p-2 rounded-xl border border-white/20">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'notifications' || activeTab === 'privacy' || activeTab === 'security') && (
              <div className="py-32 text-center space-y-10">
                <div className="w-24 h-24 bg-blue-600/5 dark:bg-white/5 rounded-[36px] flex items-center justify-center mx-auto border border-blue-600/10 shadow-inner">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                    <Zap className="w-12 h-12 text-blue-600 opacity-30" />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Upgrade Pending</h3>
                  <div className="h-1 w-12 bg-blue-600/30 mx-auto rounded-full" />
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm mx-auto leading-relaxed">This sectors infrastructure is currently undergoing recalibration to support version 2.0 transponders.</p>
                </div>
              </div>
            )}
          </motion.div>

          <div className="pt-20 border-t border-slate-50 dark:border-dark-800 flex justify-center">
            <button
              onClick={() => { logout(); window.location.href = '/auth/login'; }}
              className="flex items-center gap-4 px-12 py-5 bg-red-500/10 text-red-500 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-xl hover:shadow-red-500/20 group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Deauthorize Manifestation
            </button>
          </div>
        </div>
      </div>
    </InstagramLayout>
  )
}
