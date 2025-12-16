'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Lock, Mail, Phone, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function SignupPage() {
  const router = useRouter()
  const { register, auth } = useAuth()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (auth.isLoading) return
    if (!auth.isAuthenticated) return

    const role = auth.user?.role
    if (role === 'super_admin' || role === 'temple_admin') {
      router.replace('/admin')
    } else {
      router.replace('/live-tracking')
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.role, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({
        name,
        email,
        phone,
        password,
        confirmPassword: password,
        acceptTerms: true,
      })

      // Auth effect above will redirect once user is set.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-full overflow-auto relative">
      {/* Skip to content link for accessibility */}
      <a href="#signup-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-orange-600 text-white rounded px-3 py-2">Skip to main content</a>
      {/* Animated Background (matches login) */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600">
        <div className="absolute inset-0 bg-black/20" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
            }}
            animate={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm text-white p-6 shadow-xl" role="banner">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 md:w-20 md:h-20 relative"
                aria-hidden="true"
              >
                <Image
                  src="/images/logo.png"
                  alt="Temple Crowd Management Logo"
                  fill
                  sizes="(min-width: 768px) 80px, 64px"
                  className="object-contain"
                  priority
                />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Smart Pilgrimage Management System</h1>
                <p className="text-orange-100 text-sm">Create your account to continue</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/">
                <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium" aria-label="Go to Home page">
                  Home
                </button>
              </Link>
              <Link href="/login">
                <button className="px-4 py-2 rounded-lg bg-white text-orange-600 hover:bg-orange-50 transition-colors text-sm font-medium" aria-label="Go to Login page">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="max-w-xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-10"
            >
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">Sign up to access your dashboard</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5" aria-label="Signup form" role="form">
                <div>
                  <label htmlFor="signup-name" className="block text-gray-700 font-medium mb-2">Full name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Enter your name"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Enter email"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-phone" className="block text-gray-700 font-medium mb-2">Mobile number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="signup-phone"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="10-digit mobile"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-gray-700 font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Create password"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700"
                    role="alert"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || auth.isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting || auth.isLoading ? 'Creating…' : 'Signup'}
                </button>

                <div className="text-sm text-gray-600 text-center">
                  Already have an account?{' '}
                  <Link href="/login" className="text-orange-600 font-semibold hover:underline">
                    Login
                  </Link>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
