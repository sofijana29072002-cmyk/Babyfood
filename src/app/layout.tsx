import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Малыш Ест — Трекер прикорма',
  description: 'Планировщик питания и трекер прикорма для малышей от 6 до 12 месяцев',
  manifest: '/manifest.json',
  themeColor: '#3d8440',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Малыш Ест',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  )
}
