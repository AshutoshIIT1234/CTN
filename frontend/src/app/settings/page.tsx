'use client'

import { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { InstagramLayout } from '@/components/layout/InstagramLayout'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login')
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-primary-500 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-sm text-gray-600">
              Manage your account preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200">
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
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user.role}
                      disabled
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Likes</div>
                      <div className="text-sm text-gray-600">Get notified when someone likes your post</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Comments</div>
                      <div className="text-sm text-gray-600">Get notified when someone comments on your post</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Replies</div>
                      <div className="text-sm text-gray-600">Get notified when someone replies to your comment</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Private Account</div>
                      <div className="text-sm text-gray-600">Only approved followers can see your posts</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Show Activity Status</div>
                      <div className="text-sm text-gray-600">Let others see when you're active</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Theme
                    </label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>System</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
                <div className="space-y-4">
                  <button className="w-full px-4 py-2 bg-royal-600 text-white rounded-lg font-semibold hover:bg-royal-700 transition-colors">
                    Change Password
                  </button>
                  <button className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Enable Two-Factor Authentication
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstagramLayout>
  )
}
