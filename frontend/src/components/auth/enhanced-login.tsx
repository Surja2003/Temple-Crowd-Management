'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff, AlertCircle, LogIn, Home, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

const translations = {
  en: {
    title: 'Smart Pilgrimage Management System',
    subtitle: 'Gujarat State - Secure Login Portal',
    welcomeBack: 'Welcome Back',
    loginDesc: 'Login to access your dashboard',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    invalidCredentials: 'Invalid username or password',
    demoCredentials: 'Demo Credentials',
    backToHome: 'Back to Home',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    pilgrimAccess: 'Pilgrim Access',
    adminAccess: 'Admin Access',
    poweredBy: 'Powered by Gujarat State Government',
    secureLogin: 'Secure & Encrypted Login',
  },
  hi: {
    title: 'स्मार्ट तीर्थ प्रबंधन प्रणाली',
    subtitle: 'गुजरात राज्य - सुरक्षित लॉगिन पोर्टल',
    welcomeBack: 'वापसी पर स्वागत है',
    loginDesc: 'अपने डैशबोर्ड तक पहुंचने के लिए लॉगिन करें',
    username: 'उपयोगकर्ता नाम',
    password: 'पासवर्ड',
    loginButton: 'लॉगिन',
    invalidCredentials: 'अमान्य उपयोगकर्ता नाम या पासवर्ड',
    demoCredentials: 'डेमो क्रेडेंशियल',
    backToHome: 'होम पर वापस जाएं',
    noAccount: 'कोई खाता नहीं है?',
    signUp: 'साइन अप करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    pilgrimAccess: 'तीर्थयात्री पहुंच',
    adminAccess: 'व्यवस्थापक पहुंच',
    poweredBy: 'गुजरात राज्य सरकार द्वारा संचालित',
    secureLogin: 'सुरक्षित और एन्क्रिप्टेड लॉगिन',
  },
  gu: {
    title: 'સ્માર્ટ તીર્થયાત્રા વ્યવસ્થાપન સિસ્ટમ',
    subtitle: 'ગુજરાત રાજ્ય - સુરક્ષિત લૉગિન પોર્ટલ',
    welcomeBack: 'પાછા સ્વાગત છે',
    loginDesc: 'તમારા ડેશબોર્ડને ઍક્સેસ કરવા માટે લૉગિન કરો',
    username: 'વપરાશકર્તા નામ',
    password: 'પાસવર્ડ',
    loginButton: 'લૉગિન',
    invalidCredentials: 'અમાન્ય વપરાશકર્તા નામ અથવા પાસવર્ડ',
    demoCredentials: 'ડેમો ક્રેડેન્શિયલ્સ',
    backToHome: 'હોમ પર પાછા જાઓ',
    noAccount: 'કોઈ એકાઉન્ટ નથી?',
    signUp: 'સાઈન અપ કરો',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    pilgrimAccess: 'તીર્થયાત્રી પ્રવેશ',
    adminAccess: 'એડમિન પ્રવેશ',
    poweredBy: 'ગુજરાત રાજ્ય સરકાર દ્વારા સંચાલિત',
    secureLogin: 'સુરક્ષિત અને એન્ક્રિપ્ટેડ લૉગિન',
  },
}

export default function EnhancedLogin() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedLanguage, setSelectedLanguage] = React.useState<'en' | 'hi' | 'gu'>('en')
  const router = useRouter()
  const { login } = useAuth()

  const isAdminRole = (role: unknown) => {
    return role === 'super_admin' || role === 'temple_admin' || role === 'admin'
  }

  const t = translations[selectedLanguage]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(async () => {
      try {
        await login({ email: username, password })
        // Login successful, auth context will update
        // Check user role from auth context after login
        const storedUser = localStorage.getItem('demo_user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (isAdminRole(user.role)) {
            router.push('/admin')
          } else {
            router.push('/live-tracking')
          }
        } else {
          router.push('/live-tracking')
        }
      } catch {
        setError(t.invalidCredentials)
      }
      setIsLoading(false)
    }, 800)
  }

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername)
    setPassword(demoPassword)
    setError('')
    setIsLoading(true)

    setTimeout(async () => {
      try {
        await login({ email: demoUsername, password: demoPassword })
        // Login successful, check role and redirect
        const storedUser = localStorage.getItem('demo_user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          if (isAdminRole(user.role)) {
            router.push('/admin')
          } else {
            router.push('/live-tracking')
          }
        } else {
          router.push('/live-tracking')
        }
      } catch {
        setError(t.invalidCredentials)
      }
      setIsLoading(false)
    }, 800)
  }

  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-screen w-full overflow-auto relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600">
        <div className="absolute inset-0 bg-black/20" />
        {mounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
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
        <div className="bg-black/20 backdrop-blur-sm text-white p-4 md:p-6 shadow-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 md:w-14 md:h-14 relative"
              >
                <img
                  src="/images/logo.png"
                  alt="Temple Crowd Management Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold mb-1">{t.title}</h1>
                <p className="text-orange-100 text-xs md:text-sm">{t.subtitle}</p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-2">
              {(['en', 'hi', 'gu'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    selectedLanguage === lang
                      ? 'bg-white text-orange-600'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ગુજરાતી'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-start justify-center p-6 pt-6 md:pt-8 pb-12 overflow-auto">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-10"
            >
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.welcomeBack}</h2>
                <p className="text-gray-600">{t.loginDesc}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">{t.username}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => alert('Password reset feature coming soon! Please contact support.')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl shadow-xl transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      {t.loginButton}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center text-sm text-gray-600">
                  {t.noAccount}{' '}
                  <Link
                    href="/signup"
                    className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t.signUp}
                  </Link>
                </div>

                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors group"
                >
                  <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {t.backToHome}
                </Link>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-200">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">{t.secureLogin}</span>
                </div>
              </div>
            </motion.div>

            {/* Demo Credentials Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{t.demoCredentials}</h3>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('pilgrim', 'pilgrim123')}
                    className="w-full bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-2xl p-5 text-left transition-all shadow-md hover:shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-500 p-3 rounded-xl shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-800 font-bold text-lg mb-1">{t.pilgrimAccess}</div>
                        <div className="text-sm text-gray-600">For pilgrims & devotees</div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Username:</span>
                        <code className="bg-white px-3 py-1 rounded-lg font-mono text-blue-600 font-semibold shadow-sm">pilgrim</code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Password:</span>
                        <code className="bg-white px-3 py-1 rounded-lg font-mono text-blue-600 font-semibold shadow-sm">pilgrim123</code>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('admin', 'admin123')}
                    className="w-full bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-300 rounded-2xl p-5 text-left transition-all shadow-md hover:shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-500 p-3 rounded-xl shadow-md">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-800 font-bold text-lg mb-1">{t.adminAccess}</div>
                        <div className="text-sm text-gray-600">For administrators & operators</div>
                      </div>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-purple-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Username:</span>
                        <code className="bg-white px-3 py-1 rounded-lg font-mono text-purple-600 font-semibold shadow-sm">admin</code>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Password:</span>
                        <code className="bg-white px-3 py-1 rounded-lg font-mono text-purple-600 font-semibold shadow-sm">admin123</code>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <div className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 font-medium">
                    💡 Click on any demo credential card to automatically login with that account.
                  </p>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 text-lg">✨ System Features</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />
                    <span className="font-medium">Real-time Crowd Monitoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />
                    <span className="font-medium">Virtual Queue Booking with QR Codes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />
                    <span className="font-medium">Emergency Response System</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />
                    <span className="font-medium">AI-Powered Crowd Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-sm" />
                    <span className="font-medium">SMS Notifications & Alerts</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/20 backdrop-blur-sm text-white p-4 mt-auto">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-orange-100 font-medium">
              🙏 {t.poweredBy} • Ensuring Safe & Divine Experience
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
