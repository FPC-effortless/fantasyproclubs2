import { Inter } from "next/font/google"
import { ProvidersWrapper } from "@/components/providers/providers-wrapper"
import "./globals.css"
import { Metadata } from 'next'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fantasy Pro Clubs",
  description: "Your ultimate destination for managing and tracking your Fantasy Pro Clubs journey",
}

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
        <ProvidersWrapper>
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  )
}
