import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PAIMANA | MoSPI AI Dashboard',
  description: 'AI-driven Infrastructure Monitoring System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Yahan se DashboardLayout hata diya hai taaki public pages clean rahein */}
        {children}
      </body>
    </html>
  )
}