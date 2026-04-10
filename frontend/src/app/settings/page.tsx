'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  User, Bell, Lock, Palette, Shield, LogOut, Check,
  Crown, Sun, Moon, Monitor, AlertCircle, Save, Activity,
  Settings as SettingsIcon, Globe, Zap, ShieldCheck, ArrowRight,
  Eye, EyeOff, KeyRound, AtSign, MessageCircle, Heart,
  UserPlus, Mail as MailIcon, Tag, ActivitySquare,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import api from '@/lib/api'

/* ── Types ─────────────────────────────────────────────────────────── */
interface NotifSettings {
  likes: boolean
  comments: boolean
  replies: boolean
  follows: boolean
  messages: boolean
  emailNotifications: boolean
}

interface PrivacySettings {
  privateAccount: boolean
  showActivityStatus: boolean
  allowTagging: boolean
  allowMentions: boolean
}

/* ── Toggle row ─────────────────────────────────────────────────────── */
function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ElementType
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white dark:bg-dark-800/60 px-5 py-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{label}</p>
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-dark-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

/* ── Password input ─────────────────────────────────────────────────── */
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="bg-white dark:bg-dark-800/60 px-5 py-4">
      <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl px-4 py-2.5 pr-11 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

/* ── Section header ─────────────────────────────────────────────────── */
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{title}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
  )
}

/* ── Field row ──────────────────────────────────────────────────────── */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-dark-800/60 px-5 py-4">
      <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

/* ── Settings group label ───────────────────────────────────────────── */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2 mt-5 first:mt-0">
      {children}
    </p>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore()
  const { theme, setTheme } = useTheme()

  const [activeTab, setActiveTab]   = useState('profile')
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  /* ── Profile state ────────────────────────────────────────────────── */
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio]                 = useState('')

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setBio(user.bio || '')
    }
  }, [user])

  /* ── Notification settings state ──────────────────────────────────── */
  const [notifSettings, setNotifSettings]   = useState<NotifSettings | null>(null)
  const [notifLoading, setNotifLoading]     = useState(false)
  const [notifSaving, setNotifSaving]       = useState<keyof NotifSettings | null>(null)

  const fetchNotifSettings = useCallback(async () => {
    setNotifLoading(true)
    try {
      const res = await api.get('/users/settings/notifications')
      setNotifSettings(res.data)
    } catch {
      showMessage('error', 'Could not load notification settings.')
    } finally {
      setNotifLoading(false)
    }
  }, [])

  const updateNotifSetting = async (key: keyof NotifSettings, value: boolean) => {
    if (!notifSettings) return
    const prev = notifSettings
    setNotifSettings({ ...notifSettings, [key]: value })   // optimistic
    setNotifSaving(key)
    try {
      const res = await api.put('/users/settings/notifications', { ...notifSettings, [key]: value })
      setNotifSettings(res.data)
    } catch {
      setNotifSettings(prev)   // rollback
      showMessage('error', 'Failed to save notification setting.')
    } finally {
      setNotifSaving(null)
    }
  }

  /* ── Privacy settings state ───────────────────────────────────────── */
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null)
  const [privacyLoading, setPrivacyLoading]   = useState(false)
  const [privacySaving, setPrivacySaving]     = useState<keyof PrivacySettings | null>(null)

  const fetchPrivacySettings = useCallback(async () => {
    setPrivacyLoading(true)
    try {
      const res = await api.get('/users/settings/privacy')
      setPrivacySettings(res.data)
    } catch {
      showMessage('error', 'Could not load privacy settings.')
    } finally {
      setPrivacyLoading(false)
    }
  }, [])

  const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
    if (!privacySettings) return
    const prev = privacySettings
    setPrivacySettings({ ...privacySettings, [key]: value })  // optimistic
    setPrivacySaving(key)
    try {
      const res = await api.put('/users/settings/privacy', { ...privacySettings, [key]: value })
      setPrivacySettings(res.data)
    } catch {
      setPrivacySettings(prev)   // rollback
      showMessage('error', 'Failed to save privacy setting.')
    } finally {
      setPrivacySaving(null)
    }
  }

  /* ── Security state ───────────────────────────────────────────────── */
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /* ── Lazy-load settings when tab is first visited ─────────────────── */
  useEffect(() => {
    if (activeTab === 'notifications' && !notifSettings && !notifLoading) {
      fetchNotifSettings()
    }
    if (activeTab === 'privacy' && !privacySettings && !privacyLoading) {
      fetchPrivacySettings()
    }
  }, [activeTab, notifSettings, notifLoading, privacySettings, privacyLoading, fetchNotifSettings, fetchPrivacySettings])

  /* ── Helpers ──────────────────────────────────────────────────────── */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await api.put(`/users/${user?.id}/profile`, { displayName, bio })
      setUser({ ...user!, displayName, bio })
      showMessage('success', 'Profile updated successfully.')
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('error', 'Please fill in all password fields.')
      return
    }
    if (newPassword.length < 8) {
      showMessage('error', 'New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match.')
      return
    }
    try {
      setLoading(true)
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showMessage('success', 'Password changed successfully.')
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  /* ── Config ───────────────────────────────────────────────────────── */
  const tabs = [
    { id: 'profile',       label: 'Profile',      icon: User    },
    { id: 'premium',       label: 'Premium',       icon: Crown   },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell    },
    { id: 'privacy',       label: 'Privacy',       icon: Lock    },
    { id: 'security',      label: 'Security',      icon: Shield  },
  ]

  const themeOptions = [
    { id: 'light',  label: 'Light',  icon: Sun,     preview: 'bg-white border-slate-200 text-slate-800'                              },
    { id: 'dark',   label: 'Dark',   icon: Moon,    preview: 'bg-slate-950 border-slate-700 text-white'                              },
    { id: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-950 border-slate-300 text-slate-800' },
  ]

  const premiumFeatures = [
    { icon: Globe,       title: 'Expanded Access',  desc: 'Access resources and content from all colleges.'            },
    { icon: Zap,         title: 'Priority Feed',    desc: 'Your posts get higher visibility across the network.'       },
    { icon: ShieldCheck, title: 'Verified Badge',   desc: 'Stand out with a premium badge on your profile.'           },
    { icon: Crown,       title: 'Creator Tools',    desc: 'Advanced analytics and post scheduling tools.'             },
  ]

  /* ── Notification rows config ─────────────────────────────────────── */
  const notifRows: { key: keyof NotifSettings; icon: React.ElementType; label: string; description: string }[] = [
    { key: 'likes',              icon: Heart,       label: 'Likes',               description: 'When someone likes your post.' },
    { key: 'comments',           icon: MessageCircle, label: 'Comments',          description: 'When someone comments on your post.' },
    { key: 'replies',            icon: AtSign,      label: 'Replies',             description: 'When someone replies to your comment.' },
    { key: 'follows',            icon: UserPlus,    label: 'New Followers',       description: 'When someone starts following you.' },
    { key: 'messages',           icon: MailIcon,    label: 'Direct Messages',     description: 'When you receive a new message.' },
    { key: 'emailNotifications', icon: MailIcon,    label: 'Email Notifications', description: 'Receive a daily digest via email.' },
  ]

  /* ── Privacy rows config ──────────────────────────────────────────── */
  const privacyRows: { key: keyof PrivacySettings; icon: React.ElementType; label: string; description: string }[] = [
    { key: 'privateAccount',      icon: Lock,      label: 'Private Account',       description: 'Only approved followers can see your posts.' },
    { key: 'showActivityStatus',  icon: ActivitySquare, label: 'Show Activity Status',  description: 'Let others see when you were last active.' },
    { key: 'allowTagging',        icon: Tag,       label: 'Allow Tagging',         description: 'Let others tag you in posts and comments.' },
    { key: 'allowMentions',       icon: AtSign,    label: 'Allow Mentions',        description: 'Let others @mention you in discussions.' },
  ]

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <InstagramLayout>
      {/* ── Toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={   { opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border backdrop-blur-sm whitespace-nowrap ${
              message.type === 'success'
                ? 'bg-emerald-500 border-emerald-400/40 text-white'
                : 'bg-red-500 border-red-400/40 text-white'
            }`}
          >
            {message.type === 'success'
              ? <Check       className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto min-h-screen">

        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                <SettingsIcon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                Settings
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Account Settings
            </h1>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-2xl px-3 py-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-0.5 truncate max-w-[130px]">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[130px]">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar mb-7">
          {tabs.map((tab) => {
            const Icon     = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-700 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Tab Content ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8  }}
            animate={{ opacity: 1, y: 0  }}
            exit={   { opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >

            {/* ─── Profile Tab ─────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Public Profile"
                  description="Update how others see you across CTN."
                />

                <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700 shadow-sm">

                  <FieldRow label="Display Name">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      maxLength={50}
                      className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      This is the name displayed on your profile and posts.
                    </p>
                  </FieldRow>

                  <FieldRow label="Username">
                    <div className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-not-allowed select-none">
                      <span className="text-blue-500 font-bold">@</span>
                      <span className="flex-1">{user.username}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-dark-700 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide">
                        Locked
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Username cannot be changed after account creation.
                    </p>
                  </FieldRow>

                  <FieldRow label="Bio">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 200))}
                      placeholder="Tell people a bit about yourself…"
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
                    />
                    <p className={`text-[11px] mt-1.5 text-right font-medium transition-colors ${bio.length >= 180 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {bio.length} / 200
                    </p>
                  </FieldRow>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ─── Premium Tab ─────────────────────────────────── */}
            {activeTab === 'premium' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Premium"
                  description="Unlock more features and boost your presence on CTN."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {premiumFeatures.map((f, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-dark-800/60 border border-slate-100 dark:border-dark-700 rounded-2xl p-4 flex items-start gap-3 shadow-sm"
                    >
                      <div className="w-9 h-9 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight mb-0.5">{f.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 overflow-hidden border border-white/5 shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_70%)]" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                        <Crown className="w-5 h-5 text-amber-400 fill-amber-400/40" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm leading-none mb-0.5">CTN Premium</p>
                        <p className="text-slate-400 text-xs">Unlock the full experience</p>
                      </div>
                    </div>
                    <button className="w-full mt-2 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                      Get Premium — ₹499/year
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Appearance Tab ──────────────────────────────── */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Appearance"
                  description="Choose how CTN looks for you."
                />

                <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden shadow-sm">
                  <div className="bg-white dark:bg-dark-800/60 p-5">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                      Theme
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {themeOptions.map((opt) => {
                        const isSelected = theme === opt.id
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id as 'light' | 'dark' | 'system')}
                            className={`relative rounded-2xl border-2 transition-all focus:outline-none group overflow-hidden ${
                              isSelected
                                ? 'border-blue-600 shadow-md shadow-blue-500/20'
                                : 'border-slate-200 dark:border-dark-600 hover:border-blue-400/50 dark:hover:border-blue-500/40'
                            }`}
                          >
                            {/* Preview swatch */}
                            <div className={`h-20 ${opt.preview} flex items-center justify-center border-b border-inherit`}>
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60'
                              }`}>
                                <opt.icon className="w-4 h-4" />
                              </div>
                            </div>
                            {/* Label */}
                            <div className="py-2.5 bg-white dark:bg-dark-800 flex items-center justify-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {opt.label}
                              </span>
                              {isSelected && (
                                <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Notifications Tab ────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Notifications"
                  description="Choose what you're notified about and how."
                />

                {notifLoading ? (
                  <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700 shadow-sm">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-dark-700" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-32 bg-slate-100 dark:bg-dark-700 rounded-md" />
                            <div className="h-2.5 w-48 bg-slate-100 dark:bg-dark-700 rounded-md" />
                          </div>
                        </div>
                        <div className="w-11 h-6 rounded-full bg-slate-100 dark:bg-dark-700" />
                      </div>
                    ))}
                  </div>
                ) : notifSettings ? (
                  <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700 shadow-sm">
                    <GroupLabel>In-app Notifications</GroupLabel>
                    {notifRows.slice(0, 5).map(({ key, icon, label, description }) => (
                      <ToggleRow
                        key={key}
                        icon={icon}
                        label={label}
                        description={description}
                        checked={notifSettings[key]}
                        onChange={(v) => updateNotifSetting(key, v)}
                        disabled={notifSaving === key}
                      />
                    ))}
                    <GroupLabel>Email</GroupLabel>
                    <ToggleRow
                      icon={MailIcon}
                      label="Email Notifications"
                      description="Receive a daily digest of activity to your inbox."
                      checked={notifSettings.emailNotifications}
                      onChange={(v) => updateNotifSetting('emailNotifications', v)}
                      disabled={notifSaving === 'emailNotifications'}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-100 dark:border-dark-700 p-8 text-center shadow-sm bg-white dark:bg-dark-800/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Could not load notification settings.{' '}
                      <button
                        onClick={fetchNotifSettings}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Retry
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Privacy Tab ──────────────────────────────────── */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Privacy"
                  description="Control who can see your profile, posts, and activity."
                />

                {privacyLoading ? (
                  <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700 shadow-sm">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-dark-700" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-36 bg-slate-100 dark:bg-dark-700 rounded-md" />
                            <div className="h-2.5 w-52 bg-slate-100 dark:bg-dark-700 rounded-md" />
                          </div>
                        </div>
                        <div className="w-11 h-6 rounded-full bg-slate-100 dark:bg-dark-700" />
                      </div>
                    ))}
                  </div>
                ) : privacySettings ? (
                  <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700 shadow-sm">
                    {privacyRows.map(({ key, icon, label, description }) => (
                      <ToggleRow
                        key={key}
                        icon={icon}
                        label={label}
                        description={description}
                        checked={privacySettings[key]}
                        onChange={(v) => updatePrivacySetting(key, v)}
                        disabled={privacySaving === key}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-100 dark:border-dark-700 p-8 text-center shadow-sm bg-white dark:bg-dark-800/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Could not load privacy settings.{' '}
                      <button
                        onClick={fetchPrivacySettings}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Retry
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Security Tab ─────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <SectionHeader
                  title="Security"
                  description="Update your password to keep your account secure."
                />

                <div className="rounded-2xl border border-slate-100 dark:border-dark-700 overflow-hidden divide-y divide-slate-100 dark:divide-dark-700 shadow-sm">
                  <PasswordInput
                    label="Current Password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="Enter your current password"
                  />
                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="At least 8 characters"
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repeat your new password"
                  />
                </div>

                {/* Password strength hint */}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength =
                          newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)
                            ? 4
                            : newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
                            ? 3
                            : newPassword.length >= 8
                            ? 2
                            : 1
                        return (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              level <= strength
                                ? strength === 1 ? 'bg-red-400'
                                  : strength === 2 ? 'bg-amber-400'
                                  : strength === 3 ? 'bg-blue-400'
                                  : 'bg-emerald-500'
                                : 'bg-slate-100 dark:bg-dark-700'
                            }`}
                          />
                        )
                      })}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                      {(() => {
                        const strength =
                          newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)
                            ? 4
                            : newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
                            ? 3
                            : newPassword.length >= 8
                            ? 2
                            : 1
                        return strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'
                      })()}
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    {loading ? <Activity className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>

                {/* Account info card */}
                <div className="mt-2 bg-slate-50 dark:bg-dark-800/40 border border-slate-100 dark:border-dark-700 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight mb-0.5">
                      Account email
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Two-factor authentication and active sessions management coming soon.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Divider + Logout ──────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-dark-700 flex justify-center">
          <button
            onClick={() => { logout(); window.location.href = '/auth/login' }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>

      </div>
    </InstagramLayout>
  )
}
