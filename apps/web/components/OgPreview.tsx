/**
 * @purpose Compose the static Open Graph preview artwork.
 * @role    Reuses the product overview mock with a tighter 1200x630 social-card layout.
 * @deps    Overview mock data/provider and traffic-light window chrome.
 * @gotcha  Keep the layout static and free of CTA links; this is screenshot source for og-image.png.
 */

"use client"

import { MockProvider } from "@mock/lib/trpc"
import { OverviewPage } from "@mock/dashboard/OverviewPage"
import { overviewData } from "@mock/dashboard/overviewData"
import { TrafficLights } from "./overview/TrafficLights"

export function OgPreview() {
  return (
    <div className="relative h-[630px] w-[1200px] overflow-hidden bg-[#f4f6f2] px-[72px] py-[54px] text-ink">
      <div className="relative z-10">
        <div className="font-lat text-[14px] font-semibold uppercase tracking-[0.16em] text-green">
          Flowm
        </div>
        <h1 className="mt-3 text-[48px] font-bold leading-[1.05] -tracking-[0.025em]">
          只导入，不录入
          <br />
          <span className="text-ink-3">只记录，不对账</span>
        </h1>
        <p className="mt-4 max-w-[720px] text-[20px] leading-[1.5] text-ink-2">
          为 AI Native 记账方式而生：把账单交给 Agent。
          <br />
          支持流水、资产、贷款、订阅多种视图。
        </p>
      </div>

      <div className="absolute bottom-[-164px] left-[72px] right-[72px] h-[490px] overflow-hidden rounded-[18px] border border-hair bg-white shadow-[0_34px_90px_-42px_rgba(20,40,30,0.48)]">
        <TrafficLights />
        <div className="h-[620px] origin-top scale-[0.965]">
          <MockProvider data={overviewData} path="/">
            <OverviewPage />
          </MockProvider>
        </div>
      </div>
    </div>
  )
}
