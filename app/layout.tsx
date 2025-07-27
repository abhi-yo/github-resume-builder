import SessionProvider from '@/components/SessionProvider'
import { authOptions } from '@/lib/auth'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Doto font - will be loaded via CSS
// Using DM Sans as fallback for headings
const doto = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-doto'
})

// DM Sans for body text and UI elements
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans'
})

export const metadata: Metadata = {
  metadataBase: new URL("https://githubresume.vercel.app"),
  title: "Resume Generator",
  description: "Generate a LaTeX-style resume from your GitHub profile",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Resume Generator",
    description: "Generate a LaTeX-style resume from your GitHub profile",
    url: "https://githubresume.vercel.app",
    siteName: "Resume Generator",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Resume Generator - Transform your GitHub profile into a professional resume",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Generator",
    description: "Generate a LaTeX-style resume from your GitHub profile",
    images: ["/open-graph.png"],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={`${doto.variable} ${dmSans.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
