// src/lib/push-notification.ts
// Utility for browser push notification registration and permission

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications.');
  }
  const permission = await Notification.requestPermission();
  return permission;
}

export async function showLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      return reg;
    } catch {
      throw new Error('Service worker registration failed');
    }
  }
  throw new Error('Service workers are not supported.');
}
