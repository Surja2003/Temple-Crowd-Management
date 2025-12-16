'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Heart, MapPin, Activity, AlertTriangle } from 'lucide-react'
import AdminLayout from '@/components/layout/admin-layout'
import { useLiveAdminMetrics } from '@/hooks/use-live-admin-metrics'
import { trackEvent, trackTempleEvent } from '@/lib/ga'
import { useI18n } from '@/lib/i18n-lite'

export default function AdminResourcesPage() {
  const { stats, temples } = useLiveAdminMetrics()
  const { t } = useI18n()

  const trackedRef = React.useRef(false)
  React.useEffect(() => {
    if (trackedRef.current) return
    if (temples.length === 0) return

    trackedRef.current = true
    trackEvent('admin_page_view', { source_page: 'admin_resources', page: 'resources' })

    // Capture a one-time snapshot of resource allocations per temple.
    for (const t of temples) {
      trackTempleEvent('admin_resource_snapshot', {
        temple_id: t.id,
        temple_name: t.name,
        temple_location: t.location,
        source_page: 'admin_resources',
        security_officers: t.securityOfficers,
        medical_teams: t.medicalTeams,
        buses: t.buses,
      })
    }
  }, [temples])

  const securityData = React.useMemo(
    () => temples.map(t => ({ temple: t.name, officers: t.securityOfficers })),
    [temples],
  )
  const medicalData = React.useMemo(
    () => temples.map(t => ({ temple: t.name, teams: t.medicalTeams })),
    [temples],
  )
  const transportData = React.useMemo(
    () => temples.map(t => ({ temple: t.name, buses: t.buses })),
    [temples],
  )

  return (
    <AdminLayout>
      {/* Skip to content link for accessibility */}
      <a href="#admin-resources-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">Skip to main content</a>
      <div className="p-6" role="main" aria-label="Admin resources main content">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8" aria-label="Key statistics">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'totalPilgrims')}</div>
                <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground" id="admin-resources-main-content">{stats.totalPilgrims.toLocaleString()}</div>
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

        {/* Resource Management */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('admin', 'resourceManagement') || 'Resource Management'}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6" aria-label="Resource management cards">
          {/* Security Personnel */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/15 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-200" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{t('admin', 'securityPersonnel') || 'Security Personnel'}</h3>
              </div>

              <div className="space-y-4">
                {securityData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-foreground">{item.temple}</span>
                    <span className="font-semibold text-foreground">{item.officers} {t('admin', 'officers') || 'officers'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Teams */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/15 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-200" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{t('admin', 'medicalTeams') || 'Medical Teams'}</h3>
              </div>

              <div className="space-y-4">
                {medicalData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-foreground">{item.temple}</span>
                    <span className="font-semibold text-foreground">{item.teams} {t('admin', 'teams') || 'teams'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transport */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600 dark:text-green-200" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{t('admin', 'transport') || 'Transport'}</h3>
              </div>

              <div className="space-y-4">
                {transportData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-foreground">{item.temple}</span>
                    <span className="font-semibold text-foreground">{item.buses} {t('admin', 'buses') || 'buses'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
