/* eslint-disable @typescript-eslint/no-explicit-any */

export type TempleEventParams = {
  temple_id?: number | string
  temple_name?: string
  temple_location?: string
  time_slot?: string
  source_page?: string
  enable_notifications?: boolean
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

function isDoNotTrackEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const navAny = navigator as any
  const dnt =
    navigator.doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    navAny.msDoNotTrack === '1'
  return Boolean(dnt)
}

export function isAnalyticsDisabled(): boolean {
  if (typeof window === 'undefined') return true
  if (isDoNotTrackEnabled()) return true
  try {
    return localStorage.getItem('ga-disable') === 'true'
  } catch {
    return false
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!GA_ID) return
  if (isAnalyticsDisabled()) return

  // If GA didn't initialize yet, safely no-op.
  if (typeof window.gtag !== 'function') return

  window.gtag('event', eventName, params ?? {})
}

export function trackTempleEvent(eventName: string, params: TempleEventParams) {
  trackEvent(eventName, {
    ...params,
    app: 'temple-crowd-management',
  })
}
