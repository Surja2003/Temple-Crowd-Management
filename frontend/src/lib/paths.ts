const API_PREFIX = '/api/v1';

export const apiPrefix = (p: string = '') => `${API_PREFIX}${p.startsWith('/') ? p : `/${p}`}`;
export const authPath = (p: string = '') => apiPrefix(`auth${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const templePath = (id: string, p: string = '') => apiPrefix(`temples/${id}${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const bookingPath = (p: string = '') => apiPrefix(`bookings${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const alertPath = (p: string = '') => apiPrefix(`alerts${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const analyticsPath = (p: string = '') => apiPrefix(`analytics${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const livePath = (p: string = '') => apiPrefix(`live${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const notificationsPath = (p: string = '') => apiPrefix(`notifications${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);
export const pushPath = (p: string = '') => apiPrefix(`push${p ? (p.startsWith('/') ? p : `/${p}`) : ''}`);

export const wsPath = (clientId: string = '') => {
  const base = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000').replace(/\/$/, '');
  return clientId ? `${base}/api/v1/live/ws/${clientId}` : `${base}/api/v1/live/ws/`;
};

export type PathBuilder = ReturnType<typeof templePath>;
