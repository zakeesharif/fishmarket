import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ToastProvider } from '@/components/Toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://seaitall-qb0wo6vmp-zakeesharif-7018s-projects.vercel.app'),
  title: {
    default: 'Seaitall — The World\'s Fishing Marketplace',
    template: '%s — Seaitall',
  },
  description: 'Buy and sell fishing gear, find charters, book guides, and log your catches. Seaitall is the world\'s fishing marketplace.',
  keywords: ['fishing gear', 'fishing marketplace', 'buy fishing equipment', 'sell fishing gear', 'fishing rods', 'fishing reels', 'fishing charters', 'fishing boats', 'tackle', 'lures', 'anglers'],
  robots: { index: true, follow: true },
  openGraph: {
    siteName: 'Seaitall',
    type: 'website',
    title: 'Seaitall — The World\'s Fishing Marketplace',
    description: 'Buy and sell fishing gear, find charters, book guides, and log your catches.',
    images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop', width: 1200, height: 630, alt: 'Seaitall — The World\'s Fishing Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seaitall — The World\'s Fishing Marketplace',
    description: 'Buy and sell fishing gear, find charters, book guides, and log your catches.',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
