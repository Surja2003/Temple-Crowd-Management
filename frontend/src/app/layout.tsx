import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TempleConfigProvider } from "@/config/hooks";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Temple Crowd Management",
  description: "Digital queue management system for temples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  const templeConfig = { // Mock temple config for structured data
    "@context": "https://schema.org",
    "@type": "ReligiousOrganization",
    "name": "Sri Ganesh Temple",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Temple Street",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "postalCode": "400001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "url": "https://sriganeshtemple.org",
    "telephone": "+91-22-12345678",
    "openingHours": "Mo-Su 05:00-22:00",
    "image": "https://sriganeshtemple.org/images/temple-banner.jpg",
    "description": "Historic Ganesh temple known for its spiritual significance and beautiful architecture."
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" href="/images/icons/icon-192x192.png" />
        <meta name="theme-color" content="#18181b" />

        {/* Google Analytics (GA4) - optional, privacy-friendly */}
        {gaId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script
              id="ga4-init"
              dangerouslySetInnerHTML={{
                __html: `(() => {
  try {
    const dnt = (navigator.doNotTrack === '1') || (window.doNotTrack === '1') || (navigator.msDoNotTrack === '1');
    const disabled = localStorage.getItem('ga-disable') === 'true';
    if (dnt || disabled) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer && window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${gaId}', {
      anonymize_ip: true,
      allow_ad_personalization_signals: false,
    });
  } catch {}
})();`,
              }}
            />
          </>
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const t = localStorage.getItem('theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
    if (t === 'light') document.documentElement.classList.remove('dark');
  } catch {}
})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(templeConfig) }}
        />
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/service-worker.js');
            });
          }`
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TempleConfigProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <Analytics />
            </ToastProvider>
          </AuthProvider>
        </TempleConfigProvider>
      </body>
    </html>
  );
}
