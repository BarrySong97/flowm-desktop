/**
 * @purpose Root layout and document shell for the Flowm marketing site.
 * @role    App Router entry that wires global styles and page metadata.
 * @deps    globals.css.
 * @gotcha  Fonts load via the Google Fonts @import in globals.css, not next/font.
 */

import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Flowm — 看清你的钱，在哪、有多少、要去哪",
  description:
    "Flowm 把分散在各处的账户、流水、订阅与负债汇到一处。一台诚实的财务仪表——只呈现，不替你判断。本地优先，不联网、不上传。",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
