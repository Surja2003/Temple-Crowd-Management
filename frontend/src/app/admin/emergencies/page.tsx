'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Users, AlertTriangle, MapPin, Activity } from 'lucide-react'
import AdminLayout from '@/components/layout/admin-layout'
import { useLiveAdminMetrics } from '@/hooks/use-live-admin-metrics'
import { trackEvent } from '@/lib/ga'
import { useI18n } from '@/lib/i18n-lite'

export default function AdminEmergenciesPage() {
  const { stats } = useLiveAdminMetrics()
  const { t } = useI18n()

  const trackedRef = React.useRef(false)
  React.useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    trackEvent('admin_page_view', { source_page: 'admin_emergencies', page: 'emergencies' })
  }, [])

  return (
    <AdminLayout>
      {/* Skip to content link for accessibility */}
      <a href="#admin-emergencies-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">{t('common', 'skipToContent') || 'Skip to main content'}</a>
      <div className="p-6" role="main" aria-label="Admin emergencies main content">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8" aria-label="Key statistics">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'totalPilgrims')}</div>
                <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-foreground" id="admin-emergencies-main-content">{stats.totalPilgrims.toLocaleString()}</div>
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

        {/* Emergency Management */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('admin', 'emergencyManagement') || 'Emergency Management'}</h2>
        </div>

        <Card className="bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-400/30">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center" aria-hidden="true">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{t('admin', 'noEmergencyReports') || 'No emergency reports'}</h3>
            <p className="text-muted-foreground">{t('admin', 'allCentersNormal') || 'All centers operating normally'}</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
