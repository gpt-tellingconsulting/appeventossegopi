import type { Metadata } from 'next'
import { siteConfig } from '@/config/siteConfig'
import { SectionNavigator } from '@/features/events/components/SectionNavigator'
import './globals.css'

export const metadata: Metadata = {
  title: siteConfig.seo.siteTitle,
  description: siteConfig.seo.defaultDescription,
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.defaultDescription,
    locale: siteConfig.seo.locale,
    siteName: siteConfig.platformName,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <SectionNavigator />
      </body>
    </html>
  )
}
