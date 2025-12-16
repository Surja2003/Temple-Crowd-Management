'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { Bell, BarChart3, Shield, Video, Users, LogOut, Moon, Sun } from 'lucide-react'
import AdminLanguageSwitcher from '@/components/admin/admin-language-switcher'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { trackEvent } from '@/lib/ga'
import { useI18n } from '@/lib/i18n-lite'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const { t } = useI18n()

  // Extract locale from pathname (e.g., /en/admin/..., /hi/admin/...)
  const locale = useMemo(() => {
    const match = pathname?.match(/^\/(en|hi|gu)(?=\/|$)/)
    return (match?.[1] as 'en' | 'hi' | 'gu') || 'en'
  }, [pathname])

  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)

    trackEvent('admin_theme_toggle', {
      source_page: 'admin_layout',
      theme: next ? 'dark' : 'light',
      pathname,
    })
  }

  const navItems = [
    { href: `/${locale}/admin`, label: t('admin', 'overview') || 'Overview', icon: BarChart3 },
    { href: `/${locale}/admin/emergencies`, label: t('admin', 'emergencies') || 'Emergencies', icon: Bell },
    { href: `/${locale}/admin/surveillance`, label: t('admin', 'surveillance') || 'Surveillance', icon: Video },
    { href: `/${locale}/admin/analytics`, label: t('admin', 'analytics') || 'Analytics', icon: BarChart3 },
    { href: `/${locale}/admin/resources`, label: t('admin', 'resources') || 'Resources', icon: Users },
  ]

  const handleLogout = () => {
    trackEvent('admin_logout_click', { source_page: 'admin_layout', pathname })
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" data-locale={locale}>
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">{t('admin', 'controlCenter') || 'Control Center'}</div>
              <div className="text-xs text-purple-100">{t('admin', 'adminDashboard') || 'Admin Dashboard'}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  trackEvent('admin_nav_click', {
                    source_page: 'admin_layout',
                    from: pathname,
                    to: item.href,
                    label: item.label,
                  })
                }
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-white text-purple-600 font-medium shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-white hover:bg-white/10 justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('admin', 'logout') || 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-background border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('admin', 'dashboardTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin', 'dashboardSubtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <AdminLanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => trackEvent('admin_notifications_click', { source_page: 'admin_layout', pathname })}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
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
