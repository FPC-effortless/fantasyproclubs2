import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Fantasy Pro Clubs',
  description: 'Frequently asked questions about the app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 