/**
 * @purpose Interactive app-window mock for the hero section.
 * @role    Holds the active-page state; the dock swaps between verbatim-ported pages.
 * @gotcha  Client component. Each page is the REAL renderer page driven by static mock
 *          data via its own <MockProvider> (fresh QueryClient + page pathname).
 */

"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { DockMock } from "./DockMock"
import { AssetsPage } from "@mock/assets/AssetsPage"
import { assetsData } from "@mock/assets/assetsData"
import { BudgetPage } from "@mock/budget/BudgetPage"
import { budgetData } from "@mock/budget/budgetData"
import { OverviewPage } from "@mock/dashboard/OverviewPage"
import { overviewData } from "@mock/dashboard/overviewData"
import { ImportsPage } from "@mock/imports/ImportsPage"
import { importsData } from "@mock/imports/importsData"
import { LoansPage } from "@mock/loans/LoansPage"
import { loansData } from "@mock/loans/loansData"
import { SettingsPage } from "@mock/settings/SettingsPage"
import { settingsData } from "@mock/settings/settingsData"
import { SubscriptionsPage } from "@mock/subscriptions/SubscriptionsPage"
import { subscriptionsData } from "@mock/subscriptions/subscriptionsData"
import { MockProvider } from "@mock/lib/trpc"

function page(path: string, data: Record<string, unknown>, node: ReactNode): ReactNode {
  return (
    <MockProvider data={data} path={path}>
      {node}
    </MockProvider>
  )
}

const PAGES: Record<string, { title: string; render: () => ReactNode }> = {
  overview: { title: "看板", render: () => page("/", overviewData, <OverviewPage />) },
  assets: { title: "资产", render: () => page("/assets", assetsData, <AssetsPage />) },
  flow: { title: "流水", render: () => page("/imports", importsData, <ImportsPage />) },
  subs: {
    title: "订阅",
    render: () => page("/subscriptions", subscriptionsData, <SubscriptionsPage />),
  },
  loans: { title: "贷款", render: () => page("/loans", loansData, <LoansPage />) },
  budget: { title: "预算", render: () => page("/budget", budgetData, <BudgetPage />) },
  settings: { title: "设置", render: () => page("/settings", settingsData, <SettingsPage />) },
}

export function AppMock() {
  const [page, setPage] = useState("overview")
  const current = PAGES[page] ?? PAGES.overview

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-hair bg-surface text-left shadow-[0_30px_70px_-34px_rgba(20,40,30,0.34)]">
      {/* 无窗口外框：内容从顶部开始，Dock 悬浮固定 */}
      <div className="relative min-h-0 flex-1 bg-white">
        <div key={page} className="h-full">
          {current.render()}
        </div>
        <DockMock active={page} onSelect={setPage} />
      </div>
    </div>
  )
}
