'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock } from 'lucide-react'
import PilgrimLayout from '@/components/layout/pilgrim-layout'
import { apiFetch } from '@/lib/http'
import { notificationsPath } from '@/lib/paths'
import { trackTempleEvent } from '@/lib/ga'
import { ensureWebPushSubscription } from '@/lib/web-push'
import { QRCodeSVG } from 'qrcode.react'

export default function PilgrimBookingPage() {
  const [selectedTemple, setSelectedTemple] = React.useState('')
  const [selectedSlot, setSelectedSlot] = React.useState('')
  const [name, setName] = React.useState('')
  const [mobile, setMobile] = React.useState('')
  const [numberOfPilgrims, setNumberOfPilgrims] = React.useState(1)
  const [assistance, setAssistance] = React.useState<string[]>([])
  const [enableNotifications, setEnableNotifications] = React.useState(true)

  // QR check-in/out state
  const [showQR, setShowQR] = React.useState(false)
  type Booking = {
    id: string
    temple: string
    timeSlot: string
    name: string
    mobile: string
    numberOfPilgrims: number
    queueNumber: number
    assistance: string[]
    date: string
    status: string
    enableNotifications: boolean
    createdAt: string
  }
  const [qrBooking, setQrBooking] = React.useState<Booking | null>(null)
  const [checkedIn, setCheckedIn] = React.useState(false)
  const [checkedOut, setCheckedOut] = React.useState(false)

  // Load pre-selected temple from localStorage
  React.useEffect(() => {
    const storedTemple = localStorage.getItem('selectedTemple')
    if (storedTemple) {
      const { name } = JSON.parse(storedTemple)
      setSelectedTemple(name)
      localStorage.removeItem('selectedTemple')
    }
  }, [])

  const temples = [
    { id: 1, name: 'Somnath Temple', waitTime: '60 min wait', icon: '🕉' },
    { id: 2, name: 'Dwarkadhish Temple', waitTime: '55 min wait', icon: '🏛' },
    { id: 3, name: 'Ambaji Temple', waitTime: '44 min wait', icon: '🙏' },
    { id: 4, name: 'Kalika Mata Temple', waitTime: '56 min wait', icon: '⛰' },
  ]

  const timeSlots = [
    '06:00 AM - 08:00 AM',
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ]

  const assistanceOptions = ['Wheelchair', 'Elderly Priority', 'Medical Support']

  const selectTemple = React.useCallback((temple: { id: number; name: string; waitTime: string; icon: string }) => {
    setSelectedTemple(temple.name)
    trackTempleEvent('temple_select', {
      temple_id: temple.id,
      temple_name: temple.name,
      source_page: 'pilgrim-booking',
    })
  }, [])

  const selectTimeSlot = React.useCallback((slot: string) => {
    setSelectedSlot(slot)
    trackTempleEvent('time_slot_select', {
      temple_name: selectedTemple || undefined,
      time_slot: slot,
      source_page: 'pilgrim-booking',
    })
  }, [selectedTemple])

  const handleAssistanceChange = (option: string) => {
    setAssistance(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    )
  }

  const subscribeSmsUpdates = async (booking: {
    id: string
    temple: string
    timeSlot: string
    queueNumber: number
    mobile: string
    enableNotifications: boolean
  }) => {
    if (!booking.enableNotifications) return
    try {
      const res = await apiFetch(notificationsPath('/subscribe'), {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking.id,
          mobile: booking.mobile,
          temple: booking.temple,
          queueNumber: booking.queueNumber,
          timeSlot: booking.timeSlot,
          enabled: true,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.warn('[notifications] subscribe failed', res.status, text)
      }
    } catch (e) {
      console.warn('[notifications] subscribe error', e)
    }
  }

  return (
    <PilgrimLayout>
      {/* Skip to content link for accessibility */}
      <a href="#booking-main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">Skip to main content</a>
      <div className="w-full h-full p-4 sm:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground" id="booking-main-content">Book Darshan Queue</h2>
            <p className="text-sm text-muted-foreground mt-1">Reserve your spot in advance</p>
          </div>

        {/* QR Check-in/out Section */}
        {showQR && qrBooking && (
          <Card className="mb-6">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="mb-2 text-lg font-semibold">Your Booking QR Code</div>
              <QRCodeSVG value={JSON.stringify({
                id: qrBooking.id,
                mobile: qrBooking.mobile,
                temple: qrBooking.temple,
                queueNumber: qrBooking.queueNumber,
                timeSlot: qrBooking.timeSlot,
                date: qrBooking.date
              })} size={180} includeMargin={true} />
              <div className="flex gap-4 mt-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={checkedIn}
                  onClick={() => {
                    setCheckedIn(true)
                    setCheckedOut(false)
                    alert('✅ Checked in successfully!')
                  }}
                >
                  {checkedIn ? 'Checked In' : 'Check In'}
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!checkedIn || checkedOut}
                  onClick={() => {
                    setCheckedOut(true)
                    alert('✅ Checked out successfully!')
                  }}
                >
                  {checkedOut ? 'Checked Out' : 'Check Out'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQR(false)}
                >
                  Close
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Show this QR at the temple for check-in/out</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 space-y-6" role="form" aria-label="Booking form">
            {/* Name Input */}
            <div>
              <Label htmlFor="name" className="text-foreground font-medium mb-2 block">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-12"
                required
                aria-required="true"
                aria-invalid={name.length === 0 ? "true" : undefined}
              />
            </div>

            {/* Mobile Number Input */}
            <div>
              <Label htmlFor="mobile" className="text-foreground font-medium mb-2 block">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="h-12"
                maxLength={10}
                required
                aria-required="true"
                aria-invalid={mobile.length !== 10 ? "true" : undefined}
              />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="notifications"
                  checked={enableNotifications}
                  onCheckedChange={(checked) => setEnableNotifications(checked as boolean)}
                  aria-label="Enable SMS queue updates"
                />
                <Label htmlFor="notifications" className="text-sm text-muted-foreground cursor-pointer">
                  Send me hourly queue updates via SMS
                </Label>
              </div>
            </div>

            {/* Number of Pilgrims */}
            <div>
              <Label htmlFor="pilgrims" className="text-foreground font-medium mb-2 block">Number of Pilgrims</Label>
              <Input
                id="pilgrims"
                type="number"
                min="1"
                max="10"
                value={numberOfPilgrims}
                onChange={(e) => setNumberOfPilgrims(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                placeholder="Enter number of people"
                className="h-12"
                required
                aria-required="true"
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum 10 pilgrims per booking</p>
            </div>

            {/* Temple Selection */}
            <div>
              <Label className="text-foreground font-medium mb-3 block">Select Temple</Label>
              <div className="grid gap-3" role="radiogroup" aria-label="Select Temple">
                {temples.map((temple) => (
                  <label
                    key={temple.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemple === temple.name
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="temple"
                      className="sr-only"
                      checked={selectedTemple === temple.name}
                      onChange={() => selectTemple(temple)}
                      aria-label={temple.name}
                    />
                    <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-2xl shadow-sm border" aria-hidden="true">
                      {temple.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{temple.name}</div>
                      <div className="text-sm text-muted-foreground">{temple.waitTime}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <Label className="text-foreground font-medium mb-3 block">
                Select Time Slot
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSlot === slot
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      className="sr-only"
                      checked={selectedSlot === slot}
                      onChange={() => selectTimeSlot(slot)}
                      aria-label={slot}
                    />
                    <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assistance Options */}
            <div>
              <Label className="text-foreground font-medium mb-3 flex items-center gap-2">
                <span>♿</span>
                I require assistance
              </Label>
              <div className="space-y-2">
                {assistanceOptions.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <Checkbox
                      id={option}
                      checked={assistance.includes(option)}
                      onCheckedChange={() => handleAssistanceChange(option)}
                    />
                    <Label htmlFor={option} className="text-foreground cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Button */}
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
              disabled={!selectedTemple || !selectedSlot || !name || mobile.length !== 10}
              onClick={() => {
                if (selectedTemple && selectedSlot && name && mobile.length === 10) {
                  trackTempleEvent('booking_submit', {
                    temple_name: selectedTemple,
                    time_slot: selectedSlot,
                    enable_notifications: enableNotifications,
                    source_page: 'pilgrim-booking',
                  })
                  // Generate booking ID and queue number
                  const bookingId = `BKG${Date.now()}`
                  const queueNumber = Math.floor(Math.random() * 900) + 100
                  const bookingDate = new Date().toISOString().split('T')[0]

                  // Create booking object
                  const booking = {
                    id: bookingId,
                    temple: selectedTemple,
                    timeSlot: selectedSlot,
                    name: name,
                    mobile: mobile,
                    numberOfPilgrims: numberOfPilgrims,
                    queueNumber: queueNumber,
                    assistance: assistance,
                    date: bookingDate,
                    status: 'confirmed',
                    enableNotifications: enableNotifications,
                    createdAt: new Date().toISOString()
                  }

                  // Save to localStorage
                  const existingBookings = JSON.parse(localStorage.getItem('myBookings') || '[]')
                  existingBookings.push(booking)
                  localStorage.setItem('myBookings', JSON.stringify(existingBookings))
                  window.dispatchEvent(new Event('bookings:changed'))

                  // Register hourly SMS updates with backend (best-effort)
                  void subscribeSmsUpdates({
                    id: booking.id,
                    temple: booking.temple,
                    timeSlot: booking.timeSlot,
                    queueNumber: booking.queueNumber,
                    mobile: booking.mobile,
                    enableNotifications: booking.enableNotifications,
                  })

                  // Register Web Push subscription (best-effort)
                  if (booking.enableNotifications) {
                    void ensureWebPushSubscription({
                      bookingId: booking.id,
                      temple: booking.temple,
                      queueNumber: booking.queueNumber,
                      timeSlot: booking.timeSlot,
                      enabled: true,
                    })
                  }

                  // Show QR code for check-in/out
                  setQrBooking(booking)
                  setShowQR(true)
                  setCheckedIn(false)
                  setCheckedOut(false)

                  // Show confirmation
                  alert(`✅ Booking Confirmed!\n\nTemple: ${selectedTemple}\nTime: ${selectedSlot}\nPilgrims: ${numberOfPilgrims}\nQueue Number: ${queueNumber}\nMobile: ${mobile}\nAssistance: ${assistance.join(', ') || 'None'}\n${enableNotifications ? '\n📱 You will receive hourly updates on +91 ' + mobile : ''}\n\nYour ticket is ready to download!`)

                  // Reset form
                  setName('')
                  setMobile('')
                  setNumberOfPilgrims(1)
                  setSelectedTemple('')
                  setSelectedSlot('')
                  setAssistance([])
                  setEnableNotifications(true)
                }
              }}
            >
              Book Now
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </PilgrimLayout>
  )
}
