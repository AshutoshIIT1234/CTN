'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Brain, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
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
      
      // Store auth data
      setUser(response.data.user)
      setToken(response.data.token)
      
      // Redirect to homepage
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-royal-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to continue to CTN
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 pr-12"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-royal-600 focus:ring-royal-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm text-royal-600 hover:text-royal-700 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                isLoading || !formData.email || !formData.password
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-royal-600 text-white hover:bg-royal-700 shadow-sm'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-royal-600 hover:text-royal-700 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-royal-600 hover:text-royal-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-royal-600 hover:text-royal-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}