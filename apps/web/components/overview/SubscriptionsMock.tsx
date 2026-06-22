/**
 * @purpose Static mock of the desktop 订阅 (subscriptions) page.
 * @role    One of the swappable pages inside the hero app window.
 */

import { AddBtn, HeadStat, PageHeader } from "./pageparts"
import { SectionTitle } from "./atoms"

const SUBS = [
  { cycle: "月付", name: "Netflix", meta: "下次 06-15 · 自动续费", amt: "¥68.00" },
  { cycle: "月付", name: "网易云音乐", meta: "下次 06-08 · 自动续费", amt: "¥88.00" },
  { cycle: "月付", name: "爱奇艺", meta: "下次 06-01 · 自动续费", amt: "¥25.00" },
  { cycle: "月付", name: "1Password", meta: "下次 06-21 · 自动续费", amt: "¥99.00" },
  { cycle: "年付", name: "Microsoft 365", meta: "下次 12-10 · 手动", amt: "¥599.00" },
  { cycle: "月付", name: "Adobe CC", meta: "下次 06-05 · 自动续费", amt: "¥710.00" },
]

// day -> { color, amount } for the calendar highlights
const CHARGES: Record<number, { color: string; amt: string; name: string }> = {
  1: { color: "#d4a017", amt: "¥25", name: "爱奇艺" },
  5: { color: "#c46a9e", amt: "¥710", name: "Adobe" },
  8: { color: "#d4a017", amt: "¥88", name: "网易云" },
  15: { color: "#7c6ac4", amt: "¥68", name: "Netflix" },
  21: { color: "#7c6ac4", amt: "¥99", name: "1Password" },
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"]

export function SubscriptionsMock() {
  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      <PageHeader>
        <HeadStat label="每月订阅" value="¥1,589" size="lg" />
        <HeadStat label="本月扣费" value="¥3,456 · 8 笔" />
        <HeadStat label="订阅数 / 自动续费" value="6 / 5" />
        <AddBtn>＋ 添加订阅</AddBtn>
      </PageHeader>

      <div className="mt-4 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-9">
        {/* 左：订阅列表 */}
        <div className="border-r border-[var(--hair-2)] pr-7">
          <div className="pb-2 text-[12.5px] font-semibold text-[var(--ink)]">全部订阅</div>
          {SUBS.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center gap-[10px] py-[8px] ${i === 0 ? "" : "border-t border-[var(--hair-3)]"}`}
            >
              <span className="inline-flex flex-none items-center rounded-full border border-[var(--hair)] bg-[var(--surface-2)] px-2 py-0.5 text-[9.5px] text-[var(--ink-3)]">
                {s.cycle}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] text-[var(--ink)]">{s.name}</div>
                <div className="mt-px text-[10.5px] text-[var(--ink-4)]">{s.meta}</div>
              </div>
              <span className="flex-none font-['IBM_Plex_Mono'] text-[13px] font-medium text-[var(--ink)]">
                {s.amt}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-baseline border-t border-dashed border-[var(--ink-4)] pt-3">
            <span className="text-[12px] text-[var(--ink-2)]">每月合计</span>
            <span className="ml-auto font-['IBM_Plex_Mono'] text-[19px] font-bold tracking-[-0.02em] text-[var(--ink)]">
              ¥1,589.00
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-[10.5px] text-[var(--ink-4)]">每年合计</span>
            <span className="ml-auto text-[12px] text-[var(--ink-4)]">¥19,068.00</span>
          </div>
        </div>

        {/* 右：扣费日历 */}
        <div>
          <div className="mb-3 flex items-baseline">
            <SectionTitle>2026 年 6 月</SectionTitle>
            <span className="ml-auto text-[10.5px] text-[var(--ink-4)]">有底色 = 当天有扣费</span>
          </div>
          <div className="grid grid-cols-7 gap-[5px]">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="pb-1 text-center text-[10px] font-semibold text-[var(--ink-3)]"
              >
                {w}
              </div>
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const c = CHARGES[d]
              const today = d === 21
              return (
                <div
                  key={d}
                  className="aspect-square rounded-[6px] border border-[var(--hair-3)] p-[5px]"
                  style={{
                    background: today
                      ? "rgba(20,121,74,0.08)"
                      : c
                        ? "var(--surface-2)"
                        : "transparent",
                  }}
                >
                  <div className="font-['IBM_Plex_Mono'] text-[10px] font-medium text-[var(--ink-3)]">
                    {d}
                  </div>
                  {c ? (
                    <div className="mt-[3px] flex items-center gap-[3px]">
                      <span
                        className="h-[6px] w-[6px] flex-none rounded-[2px]"
                        style={{ background: c.color }}
                      />
                      <span className="font-['IBM_Plex_Mono'] text-[9.5px] font-semibold text-[var(--ink)]">
                        {c.amt}
                      </span>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
