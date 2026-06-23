/**
 * @purpose Generate sitemap.xml for the static marketing site export.
 * @role    Metadata route listing indexable pages for search engines.
 * @deps    Next MetadataRoute and SEO constants.
 */

import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-06-23"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/releases`,
      lastModified: new Date("2026-06-23"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]
}
