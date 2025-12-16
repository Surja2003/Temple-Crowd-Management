'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Users, AlertTriangle, MapPin, Activity } from 'lucide-react'
import AdminLayout from '@/components/layout/admin-layout'
import { useLiveAdminMetrics } from '@/hooks/use-live-admin-metrics'
import { trackEvent, trackTempleEvent } from '@/lib/ga'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useI18n } from '@/lib/i18n-lite'

export default function AdminSurveillancePage() {
  const { stats, temples, now } = useLiveAdminMetrics()
  const pathname = usePathname()
  const locale = useMemo(() => {
    const match = pathname?.match(/^\/(en|hi|gu)(?=\/|$)/)
    return (match?.[1] as 'en' | 'hi' | 'gu') || 'en'
  }, [pathname])
  const { t } = useI18n()

  const pageTrackedRef = React.useRef(false)
  const templeImpressionsRef = React.useRef<Set<number>>(new Set())

  React.useEffect(() => {
    if (pageTrackedRef.current) return
    pageTrackedRef.current = true
    trackEvent('admin_page_view', { source_page: 'admin_surveillance', page: 'surveillance' })
  }, [])

  React.useEffect(() => {
    for (const temple of temples) {
      if (templeImpressionsRef.current.has(temple.id)) continue
      templeImpressionsRef.current.add(temple.id)
      trackTempleEvent('admin_temple_impression', {
        temple_id: temple.id,
        temple_name: temple.name,
        temple_location: temple.location,
        source_page: 'admin_surveillance',
      })
    }
  }, [temples])

  const timeLabel = React.useMemo(() => {
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [now])

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'totalPilgrims')}</div>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.totalPilgrims.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'activeEmergencies')}</div>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.activeEmergencies}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'criticalCenters')}</div>
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.criticalCenters}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">{t('admin', 'avgUtilization')}</div>
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.avgUtilization}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Surveillance Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('admin', 'liveSurveillance') || 'Live Surveillance & IoT Monitoring'}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {temples.map(temple => (
            <Card key={temple.id} className={`overflow-hidden border ${temple.borderColor}`}>
              <CardContent className={`p-6 ${temple.bgColor}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">
                        {temple.icon}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground truncate">{temple.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{temple.location}</p>
                    <p className="text-xs text-muted-foreground">Updated {timeLabel}</p>
                  </div>

                  <Badge className={temple.levelColor}>{temple.level}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin', 'crowd') || 'Crowd'}</span>
                    <span className="font-medium text-foreground">{temple.currentCrowd.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin', 'capacity') || 'Capacity'}</span>
                    <span className="font-medium text-foreground">{temple.capacity.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin', 'utilization') || 'Utilization'}</span>
                    <span className="font-medium text-foreground">{temple.utilization}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{t('admin', 'waitTime') || 'Wait Time'}</span>
                    <span className="font-medium text-foreground">{temple.waitTime} min</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" aria-hidden="true" />
                    <span>{t('admin', 'cameraStatus') || 'Camera Status'}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {temple.cameras.map(camera => (
                      <Badge key={camera.id} variant="outline">
                        {camera.label}: {camera.status}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
