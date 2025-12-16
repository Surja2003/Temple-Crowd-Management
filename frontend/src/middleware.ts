import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'hi', 'gu']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // Remove locale from pathname for internal routing
    const locale = pathname.split('/')[1]
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Rewrite to the path without locale, but keep locale in URL
    const url = request.nextUrl.clone()
    url.pathname = pathnameWithoutLocale
    
    const response = NextResponse.rewrite(url)
    response.headers.set('x-locale', locale)
    return response
  }

  // If no locale in pathname, use default locale
  // But don't redirect, just set header
  const response = NextResponse.next()
  response.headers.set('x-locale', defaultLocale)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|locales|manifest.json|service-worker.js).*)',
  ],
}
