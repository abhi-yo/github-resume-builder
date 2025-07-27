import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  process.env.VERCEL_URL 
                    ? `https://${process.env.VERCEL_URL}` 
                    : process.env.NEXTAUTH_URL || 'https://githubresume.vercel.app'

  return {
    metadataBase: new URL(baseUrl),
    title: 'Resume Generator',
    description: 'Generate a LaTeX-style resume from your GitHub profile',
    openGraph: {
      title: 'Resume Generator',
      description: 'Generate a LaTeX-style resume from your GitHub profile',
      url: '/',
      siteName: 'Resume Generator',
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: 'Resume Generator - Transform your GitHub profile into a professional resume',
          type: 'image/png',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Resume Generator',
      description: 'Generate a LaTeX-style resume from your GitHub profile',
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: 'Resume Generator - Transform your GitHub profile into a professional resume',
        },
      ],
    },
    icons: {
      icon: '/logo.png',
    },
  }
}
