import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
import './globals.css'

export const metadata: Metadata = {
  title: 'LEC predictions - lewus',
  description: 'LEC predictions - lewus',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`dark bg-background`}>{children}</body>
    </html>
  )
}
