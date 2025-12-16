'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, AlertTriangle, MapPin, Activity, CheckCircle, AlertCircle, Bus } from 'lucide-react'
import AdminLayout from '@/components/layout/admin-layout'
import { useLiveAdminMetrics } from '@/hooks/use-live-admin-metrics'
import { trackEvent, trackTempleEvent } from '@/lib/ga'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useI18n } from '@/lib/i18n-lite'

export default function AdminAnalyticsPage() {
  const { stats } = useLiveAdminMetrics()
  const pathname = usePathname()
  const locale = useMemo(() => {
    const match = pathname?.match(/^\/(en|hi|gu)(?=\/|$)/)
    return (match?.[1] as 'en' | 'hi' | 'gu') || 'en'
  }, [pathname])
  const { t } = useI18n()

  const trackedRef = React.useRef(false)
  React.useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    trackEvent('admin_page_view', { source_page: 'admin_analytics', page: 'analytics' })

    // Track the temples referenced in these recommendations.
    trackTempleEvent('admin_recommendation_impression', {
      temple_name: 'Somnath Temple',
      source_page: 'admin_analytics',
      recommendation: 'Enable virtual queue',
    })
    trackTempleEvent('admin_recommendation_impression', {
      temple_name: 'Dwarka',
      source_page: 'admin_analytics',
      recommendation: 'Activate traffic diversion / resource optimization',
    })
  }, [])

  return (
    <AdminLayout>
      {/* Skip to content link for accessibility */}
      <a href="#admin-analytics-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">Skip to main content</a>
      <div className="p-6" role="main" aria-label="Admin analytics main content">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8" aria-label="Key statistics">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'totalPilgrims')}</div>
                <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground" id="admin-analytics-main-content">{stats.totalPilgrims.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'activeEmergencies')}</div>
                <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.activeEmergencies}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'criticalCenters')}</div>
                <MapPin className="w-5 h-5 text-orange-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.criticalCenters}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'avgUtilization')}</div>
                <Activity className="w-5 h-5 text-green-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.avgUtilization}%</div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Predictive Analytics */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">AI-Powered Predictive Analytics</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8" aria-label="Analytics cards">
          {/* Peak Hour Prediction */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/5 border-blue-200 dark:border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Peak Hour Prediction</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Expected surge between <span className="font-bold text-blue-600 dark:text-blue-300">9 AM - 11 AM</span> today. Prepare additional resources.
              </p>

              <div className="bg-card rounded-lg p-4 mb-4 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Predicted Crowd Increase</div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-300">+45%</div>
                <div className="text-sm text-muted-foreground mt-1">Based on historical data & weather</div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Optimization */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/5 border-purple-200 dark:border-purple-400/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Resource Optimization</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Deploy <span className="font-bold text-purple-600 dark:text-purple-300">3 additional medical teams</span> and <span className="font-bold text-purple-600 dark:text-purple-300">5 security personnel</span> at Dwarka.
              </p>

              <div className="bg-card rounded-lg p-4 mb-4 border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Efficiency Gain</div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-300">+28%</div>
                <div className="text-sm text-muted-foreground mt-1">Optimized resource allocation</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">AI Recommendations</h2>
        </div>

        <div className="space-y-4">
          <Card className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">Enable virtual queue for Somnath Temple</h3>
                  <p className="text-muted-foreground">Reduce wait time by ~30 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">Activate traffic diversion at Dwarka</h3>
                  <p className="text-muted-foreground">Crowd level at 88% capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">Schedule additional shuttle buses</h3>
                  <p className="text-muted-foreground">Parking utilization at 92%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
