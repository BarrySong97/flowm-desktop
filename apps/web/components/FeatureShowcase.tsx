/**
 * @purpose Feature showcase panels: copy + a FULL real app page in each panel.
 * @role    Landing section below 核心理念. First panel stacks copy over a centered,
 *          fully-visible mock; the rest alternate sides with an edge-cropped mock.
 * @gotcha  Client component — embeds the real verbatim pages with static mock data; each
 *          page renders in its own <MockProvider> (fresh QueryClient + page pathname).
 */

"use client"

import type { ReactNode } from "react"
import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"
import { TrafficLights } from "./overview/TrafficLights"
import { MockProvider } from "@mock/lib/trpc"
import { OverviewPage } from "@mock/dashboard/OverviewPage"
import { overviewData } from "@mock/dashboard/overviewData"
import { AssetsPage } from "@mock/assets/AssetsPage"
import { assetsData } from "@mock/assets/assetsData"
import { BudgetPage } from "@mock/budget/BudgetPage"
import { budgetData } from "@mock/budget/budgetData"
import { SubscriptionsPage } from "@mock/subscriptions/SubscriptionsPage"
import { subscriptionsData } from "@mock/subscriptions/subscriptionsData"
import { LoansPage } from "@mock/loans/LoansPage"
import { loansData } from "@mock/loans/loansData"

const FRAME =
  "relative overflow-hidden rounded-[14px] border border-hair bg-surface shadow-[0_40px_90px_-44px_rgba(20,40,30,0.45)]"

type Row = {
  title: string
  desc: string
  data: Record<string, unknown>
  path: string
  page: ReactNode
}

const ROWS: Row[] = [
  {
    title: "一个看板，把钱看全",
    desc: "净资产、本月结余、预算、即将扣费——分散各处的钱，在一块看板上一次看清。",
    data: overviewData,
    path: "/",
    page: <OverviewPage />,
  },
  {
    title: "资产构成，看得见",
    desc: "现金、投资、不动产、负债各归各类，按比例铺成一张图。余额由你手动维护，诚实、不虚高。",
    data: assetsData,
    path: "/assets",
    page: <AssetsPage />,
  },
  {
    title: "贷款，还到哪了",
    desc: "房贷、车贷的本金、月供、剩余期数排在一起，每一笔还到了哪一步，进度条上一眼看清。",
    data: loansData,
    path: "/loans",
    page: <LoansPage />,
  },
  {
    title: "订阅扣费，排进日历",
    desc: "订阅与贷款的扣费排进时间线，未来 30 天要付多少心里有数。是提醒，不是承诺。",
    data: subscriptionsData,
    path: "/subscriptions",
    page: <SubscriptionsPage />,
  },
  {
    title: "预算，不催不评判",
    desc: "设个上限，告诉你花了多少、哪一类超了。超没超，你自己看——Flowm 只说事实。",
    data: budgetData,
    path: "/budget",
    page: <BudgetPage />,
  },
]

function Copy({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <h3 className="text-[clamp(24px,3vw,34px)] font-bold leading-[1.18] -tracking-[0.025em]">
        {title}
      </h3>
      <p className="mt-4 max-w-[460px] text-[15px] leading-[1.7] text-ink-3">{desc}</p>
      <a
        href="#download"
        className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-green transition-opacity hover:opacity-75"
      >
        了解更多 →
      </a>
    </>
  )
}

export function FeatureShowcase() {
  return (
    <section id="features-detail" className="py-[64px]">
      <Wrap>
        <SectionHead tag="产品一览" title="三层理念，落到每一页">
          过去的流水、当前的余额、未来的扣费——三层各归其位。下面这些页面，就是它们在 Flowm
          里的样子。
        </SectionHead>
        <div className="mt-12 flex flex-col gap-7">
          {ROWS.map((r, i) => {
            // First panel: copy on top (left-aligned), full mock centered below.
            if (i === 0) {
              return (
                <div
                  key={r.title}
                  className="rounded-[24px] bg-surface-2 px-[clamp(28px,5vw,72px)] py-[clamp(40px,5vw,64px)]"
                >
                  <div className="max-w-[560px]">
                    <Copy title={r.title} desc={r.desc} />
                  </div>
                  <div className={`mt-10 h-[620px] w-full ${FRAME}`}>
                    <TrafficLights />
                    <MockProvider data={r.data} path={r.path}>
                      {r.page}
                    </MockProvider>
                  </div>
                </div>
              )
            }

            // Remaining panels: copy beside an edge-cropped mock, alternating sides.
            const flip = i % 2 === 1
            return (
              <div
                key={r.title}
                className="relative grid overflow-hidden rounded-[24px] bg-surface-2 md:min-h-[700px] md:grid-cols-2"
              >
                <div
                  className={`relative z-10 flex flex-col justify-center px-[clamp(28px,5vw,72px)] py-[clamp(40px,5vw,64px)] ${
                    flip ? "md:order-2" : ""
                  }`}
                >
                  <Copy title={r.title} desc={r.desc} />
                </div>

                <div className={`relative h-[440px] md:h-auto ${flip ? "md:order-1" : ""}`}>
                  <div
                    className={`absolute top-[clamp(40px,5vw,56px)] ${flip ? "right-0" : "left-0"}`}
                  >
                    <div className={`h-[600px] w-[940px] max-w-none ${FRAME}`}>
                      {flip ? null : <TrafficLights />}
                      <MockProvider data={r.data} path={r.path}>
                        {r.page}
                      </MockProvider>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Wrap>
    </section>
  )
}
