'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Brain, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { setUser, setToken } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(60)

  useEffect(() => {
    if (!email) {
      router.push('/auth/register')
    }
  }, [email, router])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)
    
    if (newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''))
    }
  }

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('')
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/verify-email', {
        email,
        otp: code
      })

      setSuccess(true)
      setUser(response.data.user)
      setToken(response.data.token)

      // Redirect after success
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    setIsResending(true)
    setError('')

    try {
      await api.post('/auth/resend-otp', { email })
      setResendTimer(60)
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verified!
          </h1>
          <p className="text-gray-600 mb-6">
            Your account has been successfully verified. Redirecting...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-royal-600 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to register
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-royal-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We sent a 6-digit code to
          </p>
          <p className="text-royal-600 font-semibold mt-1">
            {email}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all text-gray-900"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some(digit => !digit)}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              isLoading || otp.some(digit => !digit)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-royal-600 text-white hover:bg-royal-700 shadow-sm'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className={`text-sm font-semibold transition-colors ${
                resendTimer > 0 || isResending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-royal-600 hover:text-royal-700'
              }`}
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : resendTimer > 0 ? (
                `Resend code in ${resendTimer}s`
              ) : (
                'Resend code'
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Wrong email?{' '}
            <Link
              href="/auth/register"
              className="text-royal-600 hover:text-royal-700 font-semibold transition-colors"
            >
              Register again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
