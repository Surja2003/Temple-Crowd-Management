const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const joinUrl = (path: string) => {
  if (!path) return BASE_URL;
  return path.startsWith('/') ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
};

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = joinUrl(input);
  const headers = new Headers(init?.headers || undefined);
  // Preserve explicitly provided headers; don't force Content-Type for GET
  const isGet = !init || !init.method || init.method.toUpperCase() === 'GET';
  if (!isGet && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    return await fetch(url, {
      ...init,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch'
    // Fetch throws TypeError on network issues / CORS / backend down.
    // Return a non-OK Response so callers can handle gracefully.
    const body = JSON.stringify({
      message: 'Network error',
      detail: message,
      url,
    })
    return new Response(body, {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
