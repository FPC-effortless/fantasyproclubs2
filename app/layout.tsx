import { Inter } from "next/font/google"
import "./globals.css"
import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import SupabaseProvider from '@/components/providers/supabase-provider'
import { defaultMetadata } from './metadata'

const inter = Inter({ subsets: ["latin"] })

export const metadata = defaultMetadata

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#004225",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SupabaseProvider>
              {children}
              <Toaster />
            </SupabaseProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
