'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Brain, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
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
      
      // Check if verification is required
      if (response.data.requiresVerification) {
        // Redirect to verification page
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        // Old flow - direct login (shouldn't happen with new implementation)
        setUser(response.data.user)
        setToken(response.data.token)
        router.push('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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

  const isFormValid = formData.email && formData.username && 
                     formData.password && formData.confirmPassword && 
                     formData.password === formData.confirmPassword

  const passwordsMatch = formData.password && formData.confirmPassword && 
                        formData.password === formData.confirmPassword

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-royal-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join CTN today
          </h1>
          <p className="text-gray-600">
            Create your account to start discussing
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
                Username
              </label>
              <input
                name="username"
                type="text"
                placeholder="Choose a username"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                Use your college email to access college-specific features
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 ${
                    formData.confirmPassword && !passwordsMatch
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                {formData.confirmPassword && passwordsMatch && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {formData.password && formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isLoading || !isFormValid
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-royal-600 text-white hover:bg-royal-700 shadow-sm'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-royal-600 hover:text-royal-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-royal-600 hover:text-royal-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-royal-600 hover:text-royal-700">
              Privacy Policy
            </Link>
            . We'll use your email to keep your account secure and send you important updates.
          </p>
        </div>
      </div>
    </div>
  )
}