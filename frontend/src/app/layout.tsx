import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',          // iOS notch / Dynamic Island support
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#02061a' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'CTN – Critical Thinking Network',
    template: '%s | CTN',
  },
  description:
    "India's premier intellectual network for students. Think critically, debate nationally, grow academically.",
  keywords: [
    'intellectual network',
    'student community',
    'academic discussions',
    'college network',
    'India',
    'CTN',
  ],
  authors: [{ name: 'CTN Team' }],
  creator: 'CTN',
  publisher: 'CTN',

  /* ── Open Graph ───────────────────────────────────────── */
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ctn.app',
    siteName: 'CTN – Critical Thinking Network',
    title: 'CTN – Critical Thinking Network',
    description:
      "India's premier intellectual network for students.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CTN – Critical Thinking Network',
      },
    ],
  },

  /* ── Twitter / X ──────────────────────────────────────── */
  twitter: {
    card: 'summary_large_image',
    title: 'CTN – Critical Thinking Network',
    description: "India's premier intellectual network for students.",
    images: ['/og-image.png'],
  },

  /* ── PWA / App-like manifest ──────────────────────────── */
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',   // status bar transparent (iOS)
    title: 'CTN',
    startupImage: [
      {
        url: '/splash/apple-splash-2048-2732.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-1668-2388.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-1536-2048.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-1125-2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/apple-splash-1242-2208.png',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/apple-splash-750-1334.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/apple-splash-640-1136.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },

  /* ── Favicons & Icons ─────────────────────────────────── */
  icons: {
    icon: [
      { url: '/favicon-16x16.png',  sizes: '16x16',  type: 'image/png' },
      { url: '/favicon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/favicon-96x96.png',  sizes: '96x96',  type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3B82F6' },
    ],
  },

  /* ── Robots ───────────────────────────────────────────── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  /* ── Other ────────────────────────────────────────────── */
  formatDetection: {
    telephone: false,   // Prevent iOS auto-linking phone numbers
    date: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* ── Critical mobile meta (belt-and-suspenders) ───────── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
