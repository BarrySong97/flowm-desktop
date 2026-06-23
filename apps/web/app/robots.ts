/**
 * @purpose Generate robots.txt for the static marketing site export.
 * @role    Metadata route consumed by crawlers at /robots.txt.
 * @deps    Next MetadataRoute and SEO constants.
 */

import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/og-preview",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
