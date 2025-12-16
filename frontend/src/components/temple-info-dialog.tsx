'use client'

import * as React from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import somnath from '@/config/temples/somnath-temple.json'
import dwarkadheesh from '@/config/temples/dwarkadheesh-temple.json'

type TempleConfig = {
  basic?: {
    name?: string
    description?: string
    address?: {
      city?: string
      state?: string
      country?: string
      coordinates?: { latitude?: number; longitude?: number }
    }
    contact?: {
      phone?: string[]
      website?: string
    }
  }
  operations?: {
    timings?: {
      general?: {
        open?: string
        close?: string
        lastEntry?: string
        breaks?: Array<{ start?: string; end?: string }>
      }
    }
  }
  location?: {
    amenities?: Array<{ name?: string; available?: boolean }>
  }
}

const CONFIG_BY_NAME: Record<string, TempleConfig> = {
  [somnath.basic.name]: somnath as unknown as TempleConfig,
  [dwarkadheesh.basic.name]: dwarkadheesh as unknown as TempleConfig,
}

export function TempleInfoDialog(props: {
  templeName: string
  locationText?: string
  onOpenChange?: (open: boolean) => void
}) {
  const cfg = CONFIG_BY_NAME[props.templeName]

  const description = cfg?.basic?.description
  const city = cfg?.basic?.address?.city
  const state = cfg?.basic?.address?.state
  const country = cfg?.basic?.address?.country
  const coords = cfg?.basic?.address?.coordinates

  const open = cfg?.operations?.timings?.general?.open
  const close = cfg?.operations?.timings?.general?.close
  const lastEntry = cfg?.operations?.timings?.general?.lastEntry
  const breaks = cfg?.operations?.timings?.general?.breaks || []

  const phones = cfg?.basic?.contact?.phone || []
  const website = cfg?.basic?.contact?.website

  const amenities = (cfg?.location?.amenities || []).filter((a) => a?.available !== false)

  const mapsUrl =
    coords?.latitude != null && coords?.longitude != null
      ? `https://www.google.com/maps?q=${encodeURIComponent(`${coords.latitude},${coords.longitude}`)}`
      : undefined

  return (
    <Dialog onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Info className="w-4 h-4 mr-2" />
          View Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.templeName}</DialogTitle>
          <DialogDescription>
            {city || state || country ? [city, state, country].filter(Boolean).join(', ') : props.locationText || 'Temple details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {description && (
            <div className="text-sm text-foreground leading-relaxed">{description}</div>
          )}

          {(open || close || lastEntry) && (
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-semibold">Timings</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {open && close ? `Open: ${open} – Close: ${close}` : null}
                {lastEntry ? ` | Last entry: ${lastEntry}` : null}
              </div>
              {breaks.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Breaks: {breaks.map((b) => `${b.start || ''}-${b.end || ''}`).join(', ')}
                </div>
              )}
            </div>
          )}

          {(phones.length > 0 || website || mapsUrl) && (
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-semibold">Contact</div>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                {phones.length > 0 && <div>Phone: {phones.join(' / ')}</div>}
                {website && (
                  <div>
                    Website:{' '}
                    <a className="underline" href={website} target="_blank" rel="noreferrer">
                      {website}
                    </a>
                  </div>
                )}
                {mapsUrl && (
                  <div>
                    Maps:{' '}
                    <a className="underline" href={mapsUrl} target="_blank" rel="noreferrer">
                      Open location
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-semibold">Facilities</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {amenities.slice(0, 8).map((a) => a.name).filter(Boolean).join(' • ')}
              </div>
            </div>
          )}

          {(website || mapsUrl) && (
            <div className="flex gap-2">
              {website && (
                <Button asChild variant="secondary" className="flex-1">
                  <a href={website} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {mapsUrl && (
                <Button asChild variant="secondary" className="flex-1">
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Maps
                  </a>
                </Button>
              )}
            </div>
          )}

          {!cfg && (
            <div className="text-sm text-muted-foreground">
              Detailed information is not available for this temple yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
