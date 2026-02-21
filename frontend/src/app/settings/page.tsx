'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Shield, Save, Eye, EyeOff, Trash2, LogOut, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'
import api from '@/lib/api'

interface NotificationSettings {
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

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Profile settings
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  
  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    likes: true,
    comments: true,
    replies: true,
    follows: true,
    messages: true,
    emailNotifications: false
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    privateAccount: false,
    showActivityStatus: true,
    allowTagging: true,
    allowMentions: true
  })
  
  // Appearance settings
  const [theme, setTheme] = useState('light')
  
  // Password change
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else {
      // Load user settings
      loadSettings()
    }
  }, [user, router])

  const loadSettings = async () => {
    try {
      // Load notification settings
      const notifResponse = await api.get('/users/settings/notifications')
      if (notifResponse.data) {
        setNotifications(notifResponse.data)
      }
      
      // Load privacy settings
      const privacyResponse = await api.get('/users/settings/privacy')
      if (privacyResponse.data) {
        setPrivacy(privacyResponse.data)
      }
      
      // Load appearance settings
      const appearanceResponse = await api.get('/users/settings/appearance')
      if (appearanceResponse.data) {
        setTheme(appearanceResponse.data.theme || 'light')
      }
      
      // Load profile data
      if (user) {
        setDisplayName(user.displayName || '')
        setBio(user.bio || '')
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await api.put(`/users/${user?.id}/profile`, {
        displayName,
        bio
      })
      showMessage('success', 'Profile updated successfully!')
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setLoading(true)
      await api.put('/users/settings/notifications', notifications)
      showMessage('success', 'Notification settings saved!')
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    try {
      setLoading(true)
      await api.put('/users/settings/privacy', privacy)
      showMessage('success', 'Privacy settings saved!')
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAppearance = async () => {
    try {
      setLoading(true)
      await api.put('/users/settings/appearance', { theme })
      showMessage('success', 'Appearance settings saved!')
      // Apply theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      showMessage('success', 'Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    const confirmation = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation !== 'DELETE') {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/users/${user?.id}`)
      showMessage('success', 'Account deleted successfully')
      setTimeout(() => {
        logout()
        router.push('/')
      }, 2000)
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to delete account')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <InstagramLayout>
      {/* Success/Error Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' && <Check className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-primary-500 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Manage your account preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-royal-50 text-royal-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-royal-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-royal-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{bio.length}/150 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user.role}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-royal-600 to-primary-600 text-white rounded-lg font-semibold hover:from-royal-700 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Likes</div>
                      <div className="text-sm text-gray-600">Get notified when someone likes your post</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.likes}
                        onChange={(e) => setNotifications({ ...notifications, likes: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Comments</div>
                      <div className="text-sm text-gray-600">Get notified when someone comments on your post</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.comments}
                        onChange={(e) => setNotifications({ ...notifications, comments: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Replies</div>
                      <div className="text-sm text-gray-600">Get notified when someone replies to your comment</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.replies}
                        onChange={(e) => setNotifications({ ...notifications, replies: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">New Followers</div>
                      <div className="text-sm text-gray-600">Get notified when someone follows you</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.follows}
                        onChange={(e) => setNotifications({ ...notifications, follows: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Messages</div>
                      <div className="text-sm text-gray-600">Get notified when you receive a new message</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.messages}
                        onChange={(e) => setNotifications({ ...notifications, messages: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive notifications via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-royal-600 to-primary-600 text-white rounded-lg font-semibold hover:from-royal-700 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Private Account</div>
                      <div className="text-sm text-gray-600">Only approved followers can see your posts</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.privateAccount}
                        onChange={(e) => setPrivacy({ ...privacy, privateAccount: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Show Activity Status</div>
                      <div className="text-sm text-gray-600">Let others see when you're active</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.showActivityStatus}
                        onChange={(e) => setPrivacy({ ...privacy, showActivityStatus: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Allow Tagging</div>
                      <div className="text-sm text-gray-600">Let others tag you in their posts</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.allowTagging}
                        onChange={(e) => setPrivacy({ ...privacy, allowTagging: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Allow Mentions</div>
                      <div className="text-sm text-gray-600">Let others mention you in comments</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.allowMentions}
                        onChange={(e) => setPrivacy({ ...privacy, allowMentions: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleSavePrivacy}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-royal-600 to-primary-600 text-white rounded-lg font-semibold hover:from-royal-700 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          theme === 'light'
                            ? 'border-royal-600 bg-royal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-20 bg-white rounded-lg mb-2 border border-gray-200"></div>
                        <div className="text-sm font-semibold text-center">Light</div>
                      </button>
                      
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          theme === 'dark'
                            ? 'border-royal-600 bg-royal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-20 bg-gray-900 rounded-lg mb-2 border border-gray-700"></div>
                        <div className="text-sm font-semibold text-center">Dark</div>
                      </button>
                      
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          theme === 'system'
                            ? 'border-royal-600 bg-royal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded-lg mb-2 border border-gray-300"></div>
                        <div className="text-sm font-semibold text-center">System</div>
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveAppearance}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-royal-600 to-primary-600 text-white rounded-lg font-semibold hover:from-royal-700 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Appearance'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-royal-500 focus:border-transparent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-royal-500 focus:border-transparent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-royal-500 focus:border-transparent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleChangePassword}
                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="w-full px-6 py-3 bg-royal-600 text-white rounded-lg font-semibold hover:bg-royal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Two-Factor Authentication */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                    <button className="w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                  
                  {/* Active Sessions */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage devices where you're currently logged in</p>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">Current Device</div>
                            <div className="text-sm text-gray-600">Windows • Chrome • Active now</div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Logout */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Logout</h3>
                    <p className="text-sm text-gray-600 mb-4">Sign out from your account on this device</p>
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                  
                  {/* Delete Account */}
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      {loading ? 'Deleting Account...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstagramLayout>
  )
}
