/**
 * @purpose Compose the Flowm marketing landing page from section components.
 * @role    Root route (/) of the apps/web site.
 * @deps    Section components under apps/web/components.
 */

import { CTA } from "@/components/CTA"
import { FeatureShowcase } from "@/components/FeatureShowcase"
import { Footer } from "@/components/Footer"
import { Hero } from "@/components/Hero"
import { Nav } from "@/components/Nav"
import { Privacy } from "@/components/Privacy"
import { Problem } from "@/components/Problem"
import { Solution } from "@/components/Solution"
import { ThreeLayers } from "@/components/ThreeLayers"
import { DOWNLOAD_URL, GITHUB_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo"

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/app-icon.png`,
        sameAs: [GITHUB_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "zh-CN",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        applicationCategory: "FinanceApplication",
        operatingSystem: "macOS",
        url: SITE_URL,
        downloadUrl: DOWNLOAD_URL,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is static and intentionally not escaped into visible UI.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <ThreeLayers />
      <FeatureShowcase />
      <Privacy />
      <CTA />
      <Footer />
    </>
  )
}
