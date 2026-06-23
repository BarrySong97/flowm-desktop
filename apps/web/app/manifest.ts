/**
 * @purpose Generate the web app manifest for install and browser metadata.
 * @role    Metadata route served at /manifest.webmanifest.
 * @deps    Next MetadataRoute and SEO constants.
 */

import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — 本地优先的个人财务工具`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#14794a",
    lang: "zh-CN",
    icons: [
      {
        src: "/app-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
