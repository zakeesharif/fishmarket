import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

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
  title: 'Seaitall — The Amazon of Fishing',
  description: 'Buy and sell fishing gear, find charters, book guides, and learn to fish. Seaitall is the one stop shop for everything fishing.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
