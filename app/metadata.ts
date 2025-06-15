import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: {
    default: 'EA FC Pro Clubs Management',
    template: '%s | EA FC Pro Clubs Management'
  },
  description: 'Manage your EA FC Pro Clubs team, track performance, and compete in leagues',
  keywords: ['EA FC', 'Pro Clubs', 'Football', 'Gaming', 'Fantasy League'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'EA FC Pro Clubs Management',
    description: 'Manage your EA FC Pro Clubs team, track performance, and compete in leagues',
    siteName: 'EA FC Pro Clubs Management',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EA FC Pro Clubs Management',
    description: 'Manage your EA FC Pro Clubs team, track performance, and compete in leagues',
    creator: '@yourhandle',
  },
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-site-verification',
  },
} 