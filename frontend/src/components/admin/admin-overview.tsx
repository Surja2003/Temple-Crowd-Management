'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, AlertTriangle, MapPin, Activity } from 'lucide-react'
import AdminLayout from '@/components/layout/admin-layout'
import { useLiveAdminMetrics } from '@/hooks/use-live-admin-metrics'
import { trackEvent, trackTempleEvent } from '@/lib/ga'
import { useI18n } from '@/lib/i18n-lite'

export default function AdminOverviewPage() {
  const { stats, temples } = useLiveAdminMetrics()
  const { t } = useI18n()

  const pageTrackedRef = React.useRef(false)
  const templeImpressionsRef = React.useRef<Set<number>>(new Set())

  React.useEffect(() => {
    if (pageTrackedRef.current) return
    pageTrackedRef.current = true
    trackEvent('admin_page_view', { source_page: 'admin_overview', page: 'overview' })
  }, [])

  React.useEffect(() => {
    for (const temple of temples) {
      if (templeImpressionsRef.current.has(temple.id)) continue
      templeImpressionsRef.current.add(temple.id)
      trackTempleEvent('admin_temple_impression', {
        temple_id: temple.id,
        temple_name: temple.name,
        temple_location: temple.location,
        source_page: 'admin_overview',
      })
    }
  }, [temples])

  return (
    <AdminLayout>
      {/* Skip to content link for accessibility */}
      <a href="#admin-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">Skip to main content</a>
      <div className="p-6" role="main" aria-label="Admin dashboard main content">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8" aria-label="Key statistics">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'totalPilgrims')}</div>
                <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground" id="admin-main-content">{stats.totalPilgrims.toLocaleString()}</div>
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

        {/* Temple Status Overview */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('admin', 'templeStatusOverview')}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8" aria-label="Temple status overview">
          {temples.map((temple) => (
            <Card key={temple.name} className={`${temple.borderColor} border-2 ${temple.bgColor}`} role="region" aria-label={`${temple.name} status`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center text-2xl border" aria-hidden="true">
                      {temple.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{temple.name}</h3>
                      <p className="text-sm text-muted-foreground">{temple.location}</p>
                    </div>
                  </div>
                  <Badge className={temple.levelColor} aria-label={`Level: ${temple.level}`}>
                    {temple.level}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{t('admin', 'currentCrowd')}</span>
                    <span className="font-semibold text-foreground">{temple.currentCrowd.toLocaleString()} / {temple.capacity.toLocaleString()}</span>
                  </div>

                  <progress
                    value={temple.utilization}
                    max={100}
                    className={`w-full h-3 rounded-full overflow-hidden bg-muted ${
                      temple.utilization > 75 ? 'accent-orange-500' :
                      temple.utilization > 50 ? 'accent-yellow-500' :
                      'accent-green-500'
                    }`}
                  />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{t('admin', 'expectedWaitTime')}</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{temple.waitTime} minutes</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {temple.facilities.map((facility, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Metrics */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Detailed Metrics</h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Temple</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Current Crowd</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Wait Time</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Utilization</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {temples.map((temple, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{temple.icon}</span>
                        <div>
                          <div className="font-semibold text-foreground">{temple.name}</div>
                          <div className="text-sm text-muted-foreground">{temple.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">{temple.currentCrowd.toLocaleString()}</td>
                    <td className="p-4 text-center font-medium">{temple.waitTime} min</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <progress
                          value={temple.utilization}
                          max={100}
                          className={`w-24 h-2 rounded-full overflow-hidden bg-muted ${
                            temple.utilization > 75 ? 'accent-orange-500' :
                            temple.utilization > 50 ? 'accent-yellow-500' :
                            'accent-green-500'
                          }`}
                        />
                        <span className="font-medium">{temple.utilization}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Badge className={temple.levelColor}>
                        {temple.level.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
