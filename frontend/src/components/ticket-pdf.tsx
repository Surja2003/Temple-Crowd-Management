'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import { trackTempleEvent } from '@/lib/ga'

interface TicketPDFProps {
  booking: {
    id: string
    temple: string
    timeSlot: string
    name: string
    mobile?: string
    queueNumber: number
    assistance: string[]
    date: string
    status: string
    createdAt: string
  }
}

export default function TicketPDF({ booking }: TicketPDFProps) {
  const [downloading, setDownloading] = React.useState(false)
  const [sharing, setSharing] = React.useState<'pdf' | 'image' | null>(null)

  const buildTicketCanvas = async () => {
    // Create a canvas for the ticket
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')

    // Set canvas size (A6 ticket size)
    canvas.width = 1050
    canvas.height = 1480

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Header gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 200)
    gradient.addColorStop(0, '#F97316')
    gradient.addColorStop(1, '#EA580C')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, 200)

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('DARSHAN E-TICKET', canvas.width / 2, 80)

    ctx.font = '32px Arial'
    ctx.fillText('Gujarat Temple', canvas.width / 2, 140)

    // Temple icon
    ctx.font = '80px Arial'
    ctx.fillText('🕉', canvas.width / 2, 250)

    // Temple name
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 44px Arial'
    ctx.fillText(booking.temple, canvas.width / 2, 340)

    // Booking details box
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2
    ctx.strokeRect(50, 380, canvas.width - 100, 420)

    // Booking details
    ctx.fillStyle = '#6B7280'
    ctx.font = '28px Arial'
    ctx.textAlign = 'left'

    let yPos = 440
    const leftX = 100
    const rightX = 600

    // Queue Number (prominent)
    ctx.fillStyle = '#1E3A8A'
    ctx.fillRect(leftX - 20, yPos - 40, canvas.width - 160, 100)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 32px Arial'
    ctx.fillText('QUEUE NUMBER', leftX, yPos)
    ctx.font = 'bold 64px Arial'
    ctx.fillText(`#${booking.queueNumber}`, leftX, yPos + 60)

    yPos += 150
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 28px Arial'

    // Name
    ctx.fillText('Name:', leftX, yPos)
    ctx.font = '28px Arial'
    ctx.fillText(booking.name, rightX, yPos)

    yPos += 50
    ctx.font = 'bold 28px Arial'

    // Date
    ctx.fillText('Date:', leftX, yPos)
    ctx.font = '28px Arial'
    ctx.fillText(new Date(booking.date).toLocaleDateString('en-IN'), rightX, yPos)

    yPos += 50
    ctx.font = 'bold 28px Arial'

    // Time Slot
    ctx.fillText('Time Slot:', leftX, yPos)
    ctx.font = '28px Arial'
    ctx.fillText(booking.timeSlot, rightX, yPos)

    yPos += 50
    ctx.font = 'bold 28px Arial'

    // Booking ID
    ctx.fillText('Booking ID:', leftX, yPos)
    ctx.font = '24px Arial'
    ctx.fillText(booking.id, rightX, yPos)

    if (booking.mobile) {
      yPos += 50
      ctx.font = 'bold 28px Arial'
      ctx.fillText('Mobile:', leftX, yPos)
      ctx.font = '28px Arial'
      ctx.fillText(`+91 ${booking.mobile}`, rightX, yPos)
    }

    if (booking.assistance && booking.assistance.length > 0) {
      yPos += 50
      ctx.font = 'bold 28px Arial'
      ctx.fillText('Assistance:', leftX, yPos)
      ctx.font = '28px Arial'
      ctx.fillText(booking.assistance.join(', '), rightX, yPos)
    }

    // Generate QR Code
    const qrCanvas = document.createElement('canvas')
    const qrSize = 300

    // Create QR code data with booking information
    const qrData = JSON.stringify({
      id: booking.id,
      temple: booking.temple,
      queue: booking.queueNumber,
      date: booking.date,
      time: booking.timeSlot,
      name: booking.name,
    })

    // Generate QR code using QRCode library
    const QRCode = await import('qrcode')
    await QRCode.toCanvas(qrCanvas, qrData, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Draw QR code on ticket
    const qrX = (canvas.width - qrSize) / 2
    const qrY = 850
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)

    // QR Code label
    ctx.fillStyle = '#6B7280'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Scan this QR code at temple entrance', canvas.width / 2, qrY + qrSize + 40)

    // Footer
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '20px Arial'
    ctx.fillText('Please arrive 15 minutes before your time slot', canvas.width / 2, 1280)
    ctx.fillText('Show this ticket at the entrance', canvas.width / 2, 1320)
    ctx.fillText('Gujarat State Government | Temple Management System', canvas.width / 2, 1400)
    ctx.font = 'bold 18px Arial'
    ctx.fillText(`Generated on: ${new Date().toLocaleString('en-IN')}`, canvas.width / 2, 1440)

    return canvas
  }

  const buildPdfBlobFromCanvas = (canvas: HTMLCanvasElement) => {
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgAspect = canvas.width / canvas.height

    let drawWidth = pageWidth
    let drawHeight = drawWidth / imgAspect
    if (drawHeight > pageHeight) {
      drawHeight = pageHeight
      drawWidth = drawHeight * imgAspect
    }

    const x = (pageWidth - drawWidth) / 2
    const y = (pageHeight - drawHeight) / 2

    pdf.addImage(imgData, 'PNG', x, y, drawWidth, drawHeight)
    return pdf.output('blob') as Blob
  }

  const downloadBlob = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareFileOrDownload = async (file: File, filenameForFallback: string) => {
    const nav = navigator as unknown as {
      share?: (data: { title?: string; text?: string; files?: File[] }) => Promise<void>
      canShare?: (data: { files: File[] }) => boolean
    }

    const canShareFiles = Boolean(nav.share) && (!nav.canShare || nav.canShare({ files: [file] }))
    if (canShareFiles && nav.share) {
      await nav.share({
        title: 'Temple E-Ticket',
        text: `Booking ${booking.id} - ${booking.temple}`,
        files: [file],
      })

      trackTempleEvent('ticket_share_success', {
        temple_name: booking.temple,
        source_page: 'my_bookings',
        booking_id: booking.id,
      })
      return
    }

    downloadBlob(filenameForFallback, file)

    trackTempleEvent('ticket_share_fallback_download', {
      temple_name: booking.temple,
      source_page: 'my_bookings',
      booking_id: booking.id,
    })
    alert('Sharing is not supported on this device/browser. Download started instead.')
  }

  const downloadTicketAsPDF = async () => {
    trackTempleEvent('ticket_download_pdf_click', {
      temple_name: booking.temple,
      source_page: 'my_bookings',
      booking_id: booking.id,
      time_slot: booking.timeSlot,
    })

    setDownloading(true)

    try {
      const canvas = await buildTicketCanvas()
      const blob = buildPdfBlobFromCanvas(canvas)
      downloadBlob(`Temple-Ticket-${booking.id}.pdf`, blob)

      trackTempleEvent('ticket_download_pdf_success', {
        temple_name: booking.temple,
        source_page: 'my_bookings',
        booking_id: booking.id,
      })

      setDownloading(false)

    } catch (error) {
      console.error('Error generating ticket:', error)

      trackTempleEvent('ticket_download_pdf_error', {
        temple_name: booking.temple,
        source_page: 'my_bookings',
        booking_id: booking.id,
      })

      alert('Error generating ticket. Please try again.')
      setDownloading(false)
    }
  }

  const shareTicketAsPDF = async () => {
    trackTempleEvent('ticket_share_pdf_click', {
      temple_name: booking.temple,
      source_page: 'my_bookings',
      booking_id: booking.id,
    })

    setSharing('pdf')
    try {
      const canvas = await buildTicketCanvas()
      const blob = buildPdfBlobFromCanvas(canvas)
      const file = new File([blob], `Temple-Ticket-${booking.id}.pdf`, { type: 'application/pdf' })
      await shareFileOrDownload(file, `Temple-Ticket-${booking.id}.pdf`)
    } catch (error) {
      console.error('Error sharing ticket PDF:', error)

      trackTempleEvent('ticket_share_pdf_error', {
        temple_name: booking.temple,
        source_page: 'my_bookings',
        booking_id: booking.id,
      })

      alert('Error preparing ticket to share. Please try again.')
    } finally {
      setSharing(null)
    }
  }

  const shareTicketAsImage = async () => {
    trackTempleEvent('ticket_share_image_click', {
      temple_name: booking.temple,
      source_page: 'my_bookings',
      booking_id: booking.id,
    })

    setSharing('image')
    try {
      const canvas = await buildTicketCanvas()
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create image'))), 'image/png')
      })
      const file = new File([blob], `Temple-Ticket-${booking.id}.png`, { type: 'image/png' })
      await shareFileOrDownload(file, `Temple-Ticket-${booking.id}.png`)
    } catch (error) {
      console.error('Error sharing ticket image:', error)

      trackTempleEvent('ticket_share_image_error', {
        temple_name: booking.temple,
        source_page: 'my_bookings',
        booking_id: booking.id,
      })

      alert('Error preparing ticket to share. Please try again.')
    } finally {
      setSharing(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* QR Code Preview */}
      <div className="bg-card p-4 rounded-lg border-2 border-border flex flex-col items-center">
        <div className="text-sm font-semibold text-foreground mb-2">Your Ticket QR Code</div>
        <div className="bg-white rounded p-2">
          <QRCodeSVG
            value={JSON.stringify({
              id: booking.id,
              temple: booking.temple,
              queue: booking.queueNumber,
              date: booking.date,
              time: booking.timeSlot,
              name: booking.name
            })}
            size={150}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Scan at temple entrance
        </div>
      </div>

      {/* Download Button */}
      <Button
        onClick={downloadTicketAsPDF}
        disabled={downloading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
      >
        <Download className="w-4 h-4 mr-2" />
        {downloading ? 'Generating Ticket...' : 'Download E-Ticket (PDF)'}
      </Button>

      {/* Share Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={shareTicketAsPDF}
          disabled={sharing !== null || downloading}
          variant="outline"
          className="w-full"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {sharing === 'pdf' ? 'Preparing…' : 'Share PDF'}
        </Button>
        <Button
          onClick={shareTicketAsImage}
          disabled={sharing !== null || downloading}
          variant="outline"
          className="w-full"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {sharing === 'image' ? 'Preparing…' : 'Share Image'}
        </Button>
      </div>
    </div>
  )
}
