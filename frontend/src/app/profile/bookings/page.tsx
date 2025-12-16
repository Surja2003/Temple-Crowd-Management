'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import PilgrimLayout from '@/components/layout/pilgrim-layout'
import TicketPDF from '@/components/ticket-pdf'
import { trackTempleEvent } from '@/lib/ga'

interface Booking {
  id: string
  temple: string
  timeSlot: string
  name: string
  mobile?: string
  numberOfPilgrims?: number
  queueNumber: number
  assistance: string[]
  date: string
  status: string
  createdAt: string
  enableNotifications?: boolean
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([])

  React.useEffect(() => {
    const loadBookings = () => {
      try {
        const saved = localStorage.getItem('myBookings')
        setBookings(saved ? (JSON.parse(saved) as Booking[]) : [])
      } catch {
        setBookings([])
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'myBookings') loadBookings()
    }

    const onCustom = () => loadBookings()

    loadBookings()
    window.addEventListener('storage', onStorage)
    window.addEventListener('bookings:changed', onCustom as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('bookings:changed', onCustom as EventListener)
    }
  }, [])

  const deleteBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id)
    if (booking) {
      trackTempleEvent('booking_delete', {
        temple_name: booking.temple,
        source_page: 'my_bookings',
        booking_id: booking.id,
        time_slot: booking.timeSlot,
      })
    }
    const updated = bookings.filter(b => b.id !== id)
    localStorage.setItem('myBookings', JSON.stringify(updated))
    setBookings(updated)
    window.dispatchEvent(new Event('bookings:changed'))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <PilgrimLayout>
      <div className="w-full h-full p-4 sm:p-6 overflow-auto">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">My Bookings</h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage your temple bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">You haven&apos;t made any temple queue bookings</p>
              <Link href="/booking">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Book a queue slot
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/15 rounded-lg flex items-center justify-center text-2xl">
                          🕉
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{booking.temple}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-300 font-medium">Confirmed</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{booking.timeSlot}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-400/30 rounded-lg p-4 mb-3">
                        <div className="text-sm text-muted-foreground mb-1">Your Queue Number</div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-300">#{booking.queueNumber}</div>
                        {booking.numberOfPilgrims && booking.numberOfPilgrims > 1 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            👥 {booking.numberOfPilgrims} pilgrims
                          </div>
                        )}
                      </div>

                      {booking.assistance.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span className="text-base">♿</span>
                          <span>Assistance: {booking.assistance.join(', ')}</span>
                        </div>
                      )}

                      {booking.mobile && booking.enableNotifications && (
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-400/30 rounded-lg p-3 text-sm text-green-800 dark:text-green-200 mb-3">
                          📱 Hourly updates enabled on +91 {booking.mobile}
                        </div>
                      )}

                      {/* Ticket Download Section */}
                      <div className="mt-4">
                        <TicketPDF booking={booking} />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBooking(booking.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PilgrimLayout>
  )
}
