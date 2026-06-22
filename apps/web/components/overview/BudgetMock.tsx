/**
 * @purpose Static mock of the desktop 预算 (budget) page.
 * @role    One of the swappable pages inside the hero app window.
 */

import { AddBtn, HeadStat, PageHeader } from "./pageparts"
import { BudgetBar } from "./atoms"

const BUDGETS = [
  { label: "餐饮", color: "#e07b3a", spent: 1240, limit: 1500 },
  { label: "购物", color: "#4a8fc4", spent: 890, limit: 1000 },
  { label: "交通", color: "#3d9d8f", spent: 420, limit: 500 },
  { label: "居住", color: "#5bac8e", spent: 3500, limit: 3500 },
  { label: "娱乐", color: "#d4a017", spent: 650, limit: 600 },
  { label: "订阅", color: "#7c6ac4", spent: 150, limit: 200 },
]

export function BudgetMock() {
  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      <PageHeader>
        <HeadStat label="本月预算 · 已用" value="¥6,850" size="lg" />
        <HeadStat label="预算总额" value="¥7,300" />
        <HeadStat label="剩余可用" value="¥450" />
        <div className="w-[200px] pt-2">
          <div className="mb-1.5 flex justify-between">
            <span className="text-[10.5px] text-[var(--ink-4)]">整体进度</span>
            <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[var(--ink)]">
              94%
            </span>
          </div>
          <div className="h-[8px] overflow-hidden rounded-[4px] bg-[var(--hair-2)]">
            <div className="h-full rounded-[4px] bg-[var(--accent)]" style={{ width: "94%" }} />
          </div>
        </div>
        <AddBtn>＋ 添加预算</AddBtn>
      </PageHeader>

      <div className="mt-3 flex flex-col">
        {BUDGETS.map((b) => (
          <div key={b.label} className="border-t border-[var(--hair-3)] py-[13px]">
            <BudgetBar color={b.color} spent={b.spent} limit={b.limit} label={b.label} />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 text-[11px] leading-[1.6] text-[var(--ink-4)]">
        预算只统计日常可控支出（不含房贷与储蓄）。Flowm 只告诉你用了多少，不替你做超支判断。
      </div>
    </div>
  )
}
