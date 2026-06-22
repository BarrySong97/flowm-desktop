/**
 * @purpose Static mock of the desktop 贷款 (loans) page.
 * @role    One of the swappable pages inside the hero app window.
 */

import { AddBtn, HeadStat, PageHeader } from "./pageparts"

const LOANS = [
  {
    name: "招商银行 房贷",
    meta: "招商银行 · 4.5% · 月供 ¥8,500",
    remain: "¥2,100,000",
    paid: 35,
    years: "8.2",
  },
  {
    name: "建设银行 车贷",
    meta: "建设银行 · 5.2% · 月供 ¥5,200",
    remain: "¥245,600",
    paid: 62,
    years: "2.4",
  },
  {
    name: "工商银行 房贷",
    meta: "工商银行 · 3.85% · 月供 ¥4,800",
    remain: "¥1,850,000",
    paid: 28,
    years: "9.1",
  },
  {
    name: "浦发银行 装修贷",
    meta: "浦发银行 · 6.1% · 月供 ¥2,150",
    remain: "¥128,400",
    paid: 78,
    years: "1.3",
  },
]

export function LoansMock() {
  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      <PageHeader>
        <HeadStat label="欠款总额" value="¥4,323,000" size="lg" />
        <HeadStat label="每月还款" value="¥20,650" />
        <HeadStat label="占每月固定支出" value="52%" />
        <AddBtn>＋ 添加贷款</AddBtn>
      </PageHeader>

      <div className="mt-5 flex flex-col gap-7">
        {LOANS.map((l) => (
          <div key={l.name}>
            <div className="mb-3 flex items-baseline">
              <span className="text-[14px] font-semibold text-[var(--ink)] underline decoration-[var(--hair)] underline-offset-[3px]">
                {l.name}
              </span>
              <span className="ml-2 text-[11px] text-[var(--ink-4)]">{l.meta}</span>
              <span className="ml-auto font-['IBM_Plex_Mono'] text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                {l.remain}
              </span>
            </div>
            <div className="flex items-center gap-[14px]">
              <div className="relative h-[10px] flex-1 overflow-hidden rounded-[3px] bg-[var(--surface-3)] shadow-[inset_0_0_0_1px_var(--hair)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-[3px] bg-[var(--accent)]"
                  style={{ width: `${l.paid}%` }}
                />
              </div>
              <span className="flex-none font-['IBM_Plex_Mono'] text-[13px] font-semibold text-[var(--accent)]">
                已还 {l.paid}%
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-[18px] gap-y-1 text-[11px] text-[var(--ink-4)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[8px] w-[8px] rounded-[2px] bg-[var(--accent)]" />
                已还本金 {l.paid}%
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[8px] w-[8px] rounded-[2px] bg-[var(--surface-3)] shadow-[inset_0_0_0_1px_var(--hair)]" />
                余本金 {l.remain}
              </span>
              <span>约 {l.years} 年还清</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
