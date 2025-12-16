'use client'

import * as React from 'react'
import { Activity, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/http'
import { livePath } from '@/lib/paths'
import { useTranslation } from 'react-i18next'

type QueueStatus = {
  bookingId: string
  temple: string
  position: number
  total: number
  movementSpeed: 'Fast' | 'Normal' | 'Slow' | string
  estimatedEntryTime: string
  estimatedWaitMinutes: number
  lastUpdated: string
}

const copy = {
  en: {
    title: 'Queue Position Tracker',
    subtitle: 'Live updates every 10 seconds',
    getReady: 'Get Ready! Your entry is near.',
    position: 'Current position',
    speed: 'Movement',
    eta: 'Estimated entry',
    wait: 'Estimated wait',
    progress: 'Progress',
    mins: 'min',
    fast: 'Fast',
    normal: 'Normal',
    slow: 'Slow',
  },
  hi: {
    title: 'क्यू स्थिति ट्रैकर',
    subtitle: 'हर 10 सेकंड में लाइव अपडेट',
    getReady: 'तैयार हो जाइए! आपकी एंट्री नज़दीक है।',
    position: 'वर्तमान स्थिति',
    speed: 'गति',
    eta: 'अनुमानित प्रवेश',
    wait: 'अनुमानित प्रतीक्षा',
    progress: 'प्रगति',
    mins: 'मिनट',
    fast: 'तेज़',
    normal: 'सामान्य',
    slow: 'धीमा',
  },
  gu: {
    title: 'ક્યૂ સ્થિતિ ટ્રેકર',
    subtitle: 'દર 10 સેકન્ડે લાઇવ અપડેટ',
    getReady: 'તૈયાર રહો! તમારો પ્રવેશ નજીક છે.',
    position: 'વર્તમાન સ્થિતિ',
    speed: 'ગતિ',
    eta: 'અંદાજિત પ્રવેશ',
    wait: 'અંદાજિત રાહ',
    progress: 'પ્રગતિ',
    mins: 'મિનિટ',
    fast: 'ઝડપી',
    normal: 'સામાન્ય',
    slow: 'ધીમું',
  },
} as const

function speedBadge(speed: string): { labelKey: 'fast' | 'normal' | 'slow'; variant: 'default' | 'secondary' | 'outline' | 'destructive' } {
  const s = (speed || '').toLowerCase()
  if (s.includes('fast')) return { labelKey: 'fast', variant: 'default' }
  if (s.includes('slow')) return { labelKey: 'slow', variant: 'secondary' }
  return { labelKey: 'normal', variant: 'outline' }
}

export function QueuePositionTracker(props: {
  booking: {
    id: string
    temple: string
    queueNumber: number
    createdAt?: string
  }
}) {
  const { i18n } = useTranslation()
  const lang = (i18n.language || 'en') as keyof typeof copy
  const t = copy[lang] || copy.en

  const [status, setStatus] = React.useState<QueueStatus | null>(null)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch(livePath('/queue/status'), {
        method: 'POST',
        body: JSON.stringify({
          bookingId: props.booking.id,
          temple: props.booking.temple,
          queueNumber: props.booking.queueNumber,
          createdAt: props.booking.createdAt,
        }),
      })
      if (!res.ok) return
      const data = (await res.json()) as QueueStatus
      setStatus(data)
    } finally {
      setLoading(false)
    }
  }, [props.booking.createdAt, props.booking.id, props.booking.queueNumber, props.booking.temple])

  React.useEffect(() => {
    void load()
    const id = setInterval(() => void load(), 10000)
    return () => clearInterval(id)
  }, [load])

  if (!status && loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">{t.subtitle}</div>
          <div className="mt-2 text-lg font-semibold">Loading…</div>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  const progress = Math.max(0, Math.min(100, Math.round(((status.total - status.position) / Math.max(1, status.total)) * 100)))
  const isNear = status.position <= 10
  const badge = speedBadge(status.movementSpeed)

  const entryDate = new Date(status.estimatedEntryTime)
  const entryTime = isNaN(entryDate.getTime()) ? status.estimatedEntryTime : entryDate.toLocaleTimeString(lang === 'en' ? 'en-IN' : undefined, { hour: '2-digit', minute: '2-digit' })

  // Bars visualization (20 segments)
  const segments = 20
  const filled = Math.round((progress / 100) * segments)

  return (
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-foreground">{t.title}</div>
            <div className="text-sm text-muted-foreground">{t.subtitle}</div>
          </div>
          <Badge variant={badge.variant}>{t[badge.labelKey]}</Badge>
        </div>

        {isNear && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="text-sm text-foreground font-medium">{t.getReady}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">{t.position}</div>
            <div className="mt-1 text-3xl font-bold text-foreground">#{status.position}</div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> {t.speed}
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">{t[badge.labelKey]}</div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> {t.wait}
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              {status.estimatedWaitMinutes} {t.mins}
            </div>
            <div className="text-sm text-muted-foreground">{t.eta}: {entryTime}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{t.progress}</span>
            <span>{progress}%</span>
          </div>
          <progress value={progress} max={100} className="w-full h-3 rounded-full overflow-hidden bg-muted accent-primary" />
          <div className="mt-3 flex gap-1">
            {Array.from({ length: segments }).map((_, idx) => {
              const isOn = idx < filled
              return (
                <div
                  key={idx}
                  className={`h-3 flex-1 rounded ${isOn ? 'bg-primary' : 'bg-muted'}`}
                />
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
