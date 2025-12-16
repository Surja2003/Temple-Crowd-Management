import { apiFetch } from '@/lib/http'
import { pushPath } from '@/lib/paths'
import { registerServiceWorker, requestNotificationPermission } from '@/lib/push-notification'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export type WebPushSubscribeParams = {
  bookingId: string
  temple: string
  queueNumber: number
  timeSlot?: string
  enabled: boolean
}

export async function ensureWebPushSubscription(params: WebPushSubscribeParams): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false
    if (!('serviceWorker' in navigator)) return false
    if (!('PushManager' in window)) return false

    const permission = await requestNotificationPermission().catch(() => 'denied' as const)
    if (permission !== 'granted') return false

    const swReg = await registerServiceWorker()

    const keyRes = await apiFetch(pushPath('/vapid-public-key'))
    if (!keyRes.ok) return false
    const keyJson = (await keyRes.json().catch(() => null)) as null | { publicKey?: string }
    const publicKey = keyJson?.publicKey
    if (!publicKey) return false

    const applicationServerKey = urlBase64ToUint8Array(publicKey)

    let subscription = await swReg.pushManager.getSubscription()
    if (!subscription) {
      subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
    }

    const payload = {
      subscription: subscription.toJSON(),
      bookingId: params.bookingId,
      temple: params.temple,
      queueNumber: params.queueNumber,
      timeSlot: params.timeSlot,
      enabled: params.enabled,
    }

    const res = await apiFetch(pushPath('/subscribe'), {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return res.ok
  } catch {
    return false
  }
}
