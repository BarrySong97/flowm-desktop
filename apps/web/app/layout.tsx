/**
 * @purpose Root layout and document shell for the Flowm marketing site.
 * @role    App Router entry that wires global styles and page metadata.
 * @deps    globals.css.
 * @gotcha  Fonts load via the Google Fonts @import in globals.css, not next/font.
 */

import type { Metadata } from "next"
import type { Viewport } from "next"
import type { ReactNode } from "react"
import {
  OG_IMAGE_URL,
  SEO_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_ICON_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "finance",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: SITE_ICON_URL, type: "image/png", sizes: "1024x1024" }],
    shortcut: SITE_ICON_URL,
    apple: SITE_ICON_URL,
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Flowm 本地优先个人财务仪表盘预览",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#14794a",
  colorScheme: "light",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
