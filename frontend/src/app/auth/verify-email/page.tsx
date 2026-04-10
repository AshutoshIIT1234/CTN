'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, ArrowLeft, CheckCircle2, ShieldCheck, Brain } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import { useTheme } from '@/components/providers/ThemeProvider'

export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const router = useRouter()
  const { theme } = useTheme()
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

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
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex items-center justify-center p-4 transition-colors duration-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border border-white dark:border-white/10 rounded-[32px] p-12 shadow-2xl shadow-slate-200 dark:shadow-none"
        >
          <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Verification Successful</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Your account is now fully activated. We're redirecting you to your intellectual journey.</p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/auth/register" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 group transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Registration
          </Link>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Email Verification</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">We've sent a 6-digit code to</p>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">{email}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-white dark:border-white/10 rounded-[40px] p-10 shadow-3xl overflow-hidden relative"
        >
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-sm text-red-500 font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">Security Code</label>
              <div className="flex gap-3 justify-center">
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
                    className="w-12 h-16 md:w-14 md:h-20 text-center text-3xl font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-white/10 rounded-2xl transition-all outline-none text-slate-900 dark:text-white shadow-sm"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={isLoading || otp.some(digit => !digit)}
              className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 group"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
              {isLoading ? 'Authenticating...' : 'Confirm Verification'}
            </button>

            <div className="text-center pt-4">
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className="text-sm font-bold transition-all disabled:opacity-50"
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </span>
                ) : resendTimer > 0 ? (
                  <span className="text-slate-400 dark:text-slate-500">Resend available in <span className="text-blue-600 dark:text-blue-400">{resendTimer}s</span></span>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 hover:text-indigo-600">Didn't get or expired? <span className="underline">Resend Code</span></span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-10 text-slate-400 text-sm font-medium">
          Entered the wrong email?{' '}
          <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">Change Email</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-dark-950">
      <div className="text-center">
        <Brain className="w-12 h-12 text-blue-400 animate-pulse mx-auto mb-4" />
        <p className="text-slate-500 font-bold">Initializing...</p>
      </div>
    </div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
