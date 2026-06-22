/**
 * @purpose Compose the Flowm marketing landing page from section components.
 * @role    Root route (/) of the apps/web site.
 * @deps    Section components under apps/web/components.
 */

import { CTA } from "@/components/CTA"
import { FeatureShowcase } from "@/components/FeatureShowcase"
import { Features } from "@/components/Features"
import { Footer } from "@/components/Footer"
import { Hero } from "@/components/Hero"
import { Nav } from "@/components/Nav"
import { Privacy } from "@/components/Privacy"
import { Problem } from "@/components/Problem"
import { Solution } from "@/components/Solution"
import { ThreeLayers } from "@/components/ThreeLayers"

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <ThreeLayers />
      <FeatureShowcase />
      <Features />
      <Privacy />
      <CTA />
      <Footer />
    </>
  )
}
