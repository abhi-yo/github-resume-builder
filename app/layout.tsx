import SessionProvider from '@/components/SessionProvider'
import { authOptions } from '@/lib/auth'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { Crimson_Text } from 'next/font/google'
import './globals.css'

// Crimson Text is the closest to Times New Roman
const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-crimson'
})

export const metadata: Metadata = {
  title: 'Professional GitHub Resume',
  description: 'Generate a professional LaTeX-style resume from your GitHub profile',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={`${crimsonText.variable} font-serif`}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
