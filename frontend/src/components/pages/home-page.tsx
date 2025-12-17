'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/auth-context'
import { trackEvent } from '@/lib/ga'

const SLIDES = [
  '/images/gallery/licensed-image (6).jpeg',
  '/images/gallery/licensed-image (7).jpeg',
  '/images/gallery/licensed-image (8).jpeg',
  '/images/gallery/licensed-image (9).jpeg',
  '/images/gallery/licensed-image (10).jpeg',
  '/images/gallery/licensed-image (11).jpeg',
  '/images/gallery/licensed-image (12).jpeg',
  '/images/gallery/licensed-image (13).jpeg',
  '/images/gallery/licensed-image (14).jpeg',
  '/images/gallery/licensed-image (15).jpeg',
  '/images/gallery/licensed-image (16).jpeg',
  '/images/gallery/licensed-image (17).jpeg',
  '/images/gallery/licensed-image (18).jpeg',
  '/images/gallery/licensed-image (19).jpeg',
  '/images/gallery/licensed-image (20).jpeg',
  '/images/gallery/licensed-image (21).jpeg',
  '/images/gallery/licensed-image (22).jpeg',
  '/images/gallery/licensed-image (23).jpeg',
  '/images/gallery/licensed-image (24).jpeg',
  '/images/gallery/licensed-image (25).jpeg',
  '/images/gallery/licensed-image (26).jpeg',
]

export default function HomePage() {
  const router = useRouter()
  const authCtx = useAuth()

  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    if (!authCtx) return
    if (authCtx.auth.isLoading) return
    // If already logged in, go straight to the right dashboard.
    if (authCtx.auth.isAuthenticated) {
      const role = authCtx.auth.user?.role
      if (role === 'super_admin' || role === 'temple_admin') {
        router.replace('/admin')
      } else {
        router.replace('/live-tracking')
      }
    }
  }, [authCtx, router])

  React.useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex(i => (i + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const activeSlide = React.useMemo(() => encodeURI(SLIDES[activeIndex] ?? SLIDES[0] ?? ''), [activeIndex])

  return (
      <div className="h-screen w-full overflow-auto relative">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground rounded px-3 py-2">Skip to main content</a>
        {/* Theme background (distinct from login/signup) */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/35">
          <div className="absolute inset-0 bg-background/40" />
        </div>

        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 relative" aria-hidden="true">
                <Image
                  src="/images/logo.png"
                  alt="Temple Crowd Management Logo"
                  fill
                  sizes="(min-width: 640px) 56px, 48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-foreground">Temple Crowd Management</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Digital queue + safety support for pilgrims</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="outline">
                <Link
                  href="/login"
                  aria-label="Login to your account"
                  onClick={() => trackEvent('home_login_click', { source_page: 'home' })}
                >
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href="/signup"
                  aria-label="Sign up for an account"
                  onClick={() => trackEvent('home_signup_click', { source_page: 'home' })}
                >
                  Signup
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main id="main-content" role="main" className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <Card className="overflow-hidden bg-card/80 backdrop-blur border-[3px] border-primary/20 hover:border-primary/40 transition-colors shadow-lg hover:shadow-xl">
              <div className="relative w-full h-[50vh] min-h-[320px]" aria-label="Temple slideshow" aria-live="polite">
                <Image
                  src={activeSlide}
                  alt={`Temple slideshow image ${activeIndex + 1} of ${SLIDES.length}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground" id="slideshow-desc">Temple images slideshow</div>
                  <div className="flex gap-1" role="group" aria-label="Slideshow navigation">
                    {SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`h-2 w-2 rounded-full transition-colors ${idx === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        aria-current={idx === activeIndex ? 'true' : undefined}
                        tabIndex={0}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-card/80 backdrop-blur border-[3px] border-blue-500/20 hover:border-blue-500/40 transition-colors shadow-lg hover:shadow-xl">
            <CardHeader>
              <CardTitle>What we do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We help pilgrims plan darshan smoothly by reducing crowding, improving safety, and keeping you informed.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Queue slot booking with token number</li>
                <li>Live crowd tracking and status updates</li>
                <li>Temple alerts and guidance</li>
                <li>Emergency support and quick calling</li>
              </ul>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full" onClick={() => trackEvent('home_get_started_click', { source_page: 'home' })}>
                    Get Started
                  </Button>
                </Link>
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full" onClick={() => trackEvent('home_book_slot_click', { source_page: 'home' })}>
                    Book a slot
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur border-[3px] border-green-500/20 hover:border-green-500/40 transition-colors shadow-lg hover:shadow-xl">
            <CardHeader>
              <CardTitle>Services provided</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <div className="font-medium text-foreground">Pilgrim services</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Book darshan time slots and view tickets</li>
                <li>Live tracking and queue status</li>
                <li>Emergency helpline access</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-[3px] border-red-500/20 hover:border-red-500/40 transition-colors shadow-lg hover:shadow-xl">
            <CardHeader>
              <CardTitle>How emergency works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Use the Emergency button from pilgrim services.</li>
                <li>Your phone dials the helpline immediately (e.g., 108).</li>
                <li>Admins can monitor and respond faster using the admin dashboard.</li>
              </ol>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline">Login to access dashboards</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
