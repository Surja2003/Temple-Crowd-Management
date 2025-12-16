'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, AlertTriangle, CalendarCheck } from 'lucide-react'
import PilgrimLayout from '@/components/layout/pilgrim-layout'
import { QueuePositionTracker } from '@/components/queue-position-tracker'
import { TempleInfoDialog } from '@/components/temple-info-dialog'
import { trackTempleEvent } from '@/lib/ga'
import { useLiveAdminMetrics } from '@/hooks/use-live-admin-metrics'

export default function LiveTrackingPage() {
  const router = useRouter()
  const { temples: liveTemples } = useLiveAdminMetrics()

  const handleBookNow = (templeId: number, templeName: string) => {
    trackTempleEvent('temple_book_now_click', {
      temple_id: templeId,
      temple_name: templeName,
      source_page: 'pilgrim-live-tracking',
    })
    // Store selected temple in localStorage for booking page
    localStorage.setItem('selectedTemple', JSON.stringify({ id: templeId, name: templeName }))
    router.push('/booking')
  }

  type BookingLite = { id: string; temple: string; queueNumber: number; createdAt?: string }

  const [bookings, setBookings] = React.useState<BookingLite[]>([])

  React.useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('myBookings')
        if (!raw) {
          setBookings([])
          return
        }
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setBookings([])
          return
        }

        const normalized = (parsed as unknown[])
          .map((item: unknown): BookingLite | null => {
            if (!item || typeof item !== 'object') return null
            const b = item as Record<string, unknown>

            const id = typeof b.id === 'string' ? b.id : b.id != null ? String(b.id) : ''
            const temple = typeof b.temple === 'string' ? b.temple : b.temple != null ? String(b.temple) : ''
            const queueNumberRaw = b.queueNumber
            const queueNumber = typeof queueNumberRaw === 'number' ? queueNumberRaw : Number(queueNumberRaw)
            const createdAt = typeof b.createdAt === 'string' ? b.createdAt : undefined

            if (!id || !temple || Number.isNaN(queueNumber) || queueNumber <= 0) return null

            if (createdAt) return { id, temple, queueNumber, createdAt }
            return { id, temple, queueNumber }
          })
          .filter((v): v is BookingLite => v !== null)

        normalized.reverse()
        setBookings(normalized)
      } catch {
        setBookings([])
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'myBookings') load()
    }
    const onCustom = () => load()

    load()
    window.addEventListener('storage', onStorage)
    window.addEventListener('bookings:changed', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('bookings:changed', onCustom as EventListener)
    }
  }, [])

  // Convert live temples to format needed for UI
  const temples = liveTemples.map(temple => ({
    id: temple.id,
    name: temple.name,
    location: temple.location,
    icon: temple.icon,
    currentCrowd: temple.currentCrowd,
    capacity: temple.capacity,
    waitTime: temple.waitTime,
    crowdLevel: temple.level,
    facilities: temple.facilities
  }))

  return (
    <PilgrimLayout>
      {/* Skip to content link for accessibility */}
      <a href="#live-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">Skip to main content</a>
      <div className="w-full h-full p-4 sm:p-6 overflow-auto">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground" id="live-main-content">Live Temple Status</h2>
          <p className="text-sm text-muted-foreground mt-1">Queue updates every 10 seconds (after booking)</p>
        </div>

        {bookings.length > 0 && (
          <div className="mb-6 sm:mb-8 space-y-4" aria-label="Your Bookings">
            {bookings.map((b) => (
              <QueuePositionTracker key={b.id} booking={b} />
            ))}
          </div>
        )}

        {/* Temple Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8" aria-label="Temple status cards">
          {temples.map((temple) => {
            const percentage = Math.round((temple.currentCrowd / temple.capacity) * 100)
            
            return (
              <Card key={temple.id} className="border bg-card" role="listitem" aria-label={`${temple.name} status`}>
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
                    <Badge variant="secondary" className="flex items-center gap-1" aria-label={`Crowd level: ${temple.crowdLevel}`}>
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      {temple.crowdLevel}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        Current Crowd
                      </span>
                      <span className="font-semibold text-foreground">{temple.currentCrowd.toLocaleString()} / {temple.capacity.toLocaleString()}</span>
                    </div>
                    <progress
                      value={percentage}
                      max={100}
                      className="w-full h-3 rounded-full overflow-hidden bg-muted accent-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">Expected Wait Time:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{temple.waitTime} minutes</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {temple.facilities.map((facility, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>

                  <div className="mb-3">
                    <TempleInfoDialog
                      templeName={temple.name}
                      locationText={temple.location}
                      onOpenChange={(open) => {
                        if (open) {
                          trackTempleEvent('temple_info_open', {
                            temple_id: temple.id,
                            temple_name: temple.name,
                            temple_location: temple.location,
                            source_page: 'pilgrim-live-tracking',
                          })
                        }
                      }}
                    />
                  </div>

                  <Button 
                    onClick={() => handleBookNow(temple.id, temple.name)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md"
                  >
                    <CalendarCheck className="w-4 h-4 mr-2" aria-hidden="true" />
                    Book Darshan Now
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Emergency Helpline */}
        <Card className="border border-destructive/30 bg-destructive/10">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-foreground">Emergency Helpline: 108</div>
                <div className="text-sm text-muted-foreground">Available 24/7 for immediate assistance</div>
              </div>
            </div>
            <Button asChild className="bg-red-500 hover:bg-red-600 text-white font-semibold">
              <a href="tel:108" aria-label="Call emergency helpline 108">
                Call Now
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PilgrimLayout>
  )
}
