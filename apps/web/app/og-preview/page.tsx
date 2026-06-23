/**
 * @purpose Expose the Open Graph artwork as a static preview page.
 * @role    Local/design preview source for generating public/og-image.png.
 * @deps    OgPreview component.
 */

import { OgPreview } from "@/components/OgPreview"

export default function OgPreviewPage() {
  return <OgPreview />
}
