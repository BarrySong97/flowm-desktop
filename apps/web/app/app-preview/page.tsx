/**
 * @purpose Expose the interactive desktop application mock as a dedicated route.
 * @role    Product-design preview surface for validating navigation and dashboard layout.
 * @deps    The shared marketing AppMock component.
 * @gotcha  This route uses static mock data and must never imply access to a user's ledger.
 */

import { AppMock } from "@/components/overview/AppMock"

export const metadata = {
  robots: { index: false, follow: false },
}

export default function AppPreviewPage() {
  return (
    <main className="h-dvh min-h-[620px] bg-[#e9eeea] p-[clamp(12px,2vw,28px)]">
      <AppMock />
    </main>
  )
}
