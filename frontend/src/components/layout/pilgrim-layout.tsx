'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useI18n } from '@/lib/i18n-lite'

export default function PilgrimLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { locale } = useI18n()

  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)
  }

  const changeLanguage = (newLocale: string) => {
    const currentPath = pathname || '/'
    const localeRegex = /^\/(en|hi|gu)(?=\/|$)/
    const pathWithoutLocale = currentPath.replace(localeRegex, '')
    const newPath = `/${newLocale}${pathWithoutLocale || '/'}`
    router.push(newPath)
  }

  const currentLang = locale

  const navItems = [
    { 
      href: '/live-tracking', 
      label: { en: 'Live Status', hi: 'लाइव स्थिति', gu: 'લાઇવ સ્થિતિ' }, 
      icon: '📍' 
    },
    { 
      href: '/booking', 
      label: { en: 'Book Queue', hi: 'क्यू बुक करें', gu: 'ક્યૂ બુક કરો' }, 
      icon: '📋' 
    },
    { 
      href: '/profile/bookings', 
      label: { en: 'My Bookings', hi: 'मेरी बुकिंग', gu: 'માઈ બુકિંગ્સ' }, 
      icon: '📅' 
    },
    { 
      href: '/alerts', 
      label: { en: 'Emergency', hi: 'आपातकाल', gu: 'કટોકટી' }, 
      icon: '⚠️' 
    },
  ]

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getLabel = (item: typeof navItems[0]) => {
    return item.label[currentLang as keyof typeof item.label] || item.label.en
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🕉</span>
            </div>
            <div>
              <div className="font-bold text-lg">Pilgrim Dashboard</div>
              <div className="text-xs text-blue-100">Welcome, Pilgrim</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-white text-blue-600 font-medium shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{getLabel(item)}</span>
              </Link>
            )
          })}
        </nav>

        {/* Language Switcher at Bottom */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-1 mb-3">
            <Button
              variant={currentLang === 'en' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('en')}
              className={`flex-1 text-xs ${currentLang === 'en' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}
            >
              EN
            </Button>
            <Button
              variant={currentLang === 'hi' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('hi')}
              className={`flex-1 text-xs ${currentLang === 'hi' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}
            >
              HI
            </Button>
            <Button
              variant={currentLang === 'gu' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage('gu')}
              className={`flex-1 text-xs ${currentLang === 'gu' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}
            >
              GU
            </Button>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-white hover:bg-white/10 justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (optional, can be removed if not needed) */}
        <div className="bg-background border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-foreground">
            {navItems.find(item => pathname === item.href || pathname?.startsWith(item.href + '/'))
              ? getLabel(navItems.find(item => pathname === item.href || pathname?.startsWith(item.href + '/'))!)
              : 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
