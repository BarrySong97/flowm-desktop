/**
 * @purpose Generate sitemap.xml for the static marketing site export.
 * @role    Metadata route listing indexable pages for search engines.
 * @deps    Next MetadataRoute, generated blog posts, and SEO constants.
 * @gotcha  Blog detail entries are derived from published MDX content.
 */

import type { MetadataRoute } from "next"
import { publishedPosts } from "@/lib/blog"
import { SITE_URL } from "@/lib/seo"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
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
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const postEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: new URL(post.permalink, SITE_URL).toString(),
    lastModified: new Date(post.date),
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries]
}
