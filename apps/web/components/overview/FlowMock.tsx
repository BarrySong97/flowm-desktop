/**
 * @purpose Static mock of the desktop 流水 (transactions) page.
 * @role    One of the swappable pages inside the hero app window.
 */

import { AddBtn, Donut, HeadStat, LegendRow, PageHeader } from "./pageparts"
import { ColorDot } from "./atoms"

const FILTERS = ["时间 · 最近 30 天", "来源 · 全部", "类别 · 全部", "类型 · 全部"]

const TX = [
  {
    d: "06-20",
    name: "Starbucks",
    cat: "餐饮",
    color: "#e07b3a",
    src: "支付宝",
    amt: "−¥45.00",
    kind: "out",
  },
  {
    d: "06-19",
    name: "地铁卡充值",
    cat: "交通",
    color: "#4a8fc4",
    src: "微信",
    amt: "−¥100.00",
    kind: "out",
  },
  {
    d: "06-18",
    name: "工资到账",
    cat: "收入",
    color: "#14794a",
    src: "招商银行",
    amt: "+¥18,500.00",
    kind: "in",
  },
  {
    d: "06-18",
    name: "Apple Music",
    cat: "订阅",
    color: "#7c6ac4",
    src: "支付宝",
    amt: "−¥11.00",
    kind: "out",
  },
  {
    d: "06-17",
    name: "家乐福超市",
    cat: "购物",
    color: "#c46a9e",
    src: "微信",
    amt: "−¥287.50",
    kind: "out",
  },
  {
    d: "06-16",
    name: "房租转账",
    cat: "居住",
    color: "#5bac8e",
    src: "招商银行",
    amt: "−¥3,200.00",
    kind: "out",
  },
  {
    d: "06-15",
    name: "兼职收入",
    cat: "收入",
    color: "#14794a",
    src: "支付宝",
    amt: "+¥800.00",
    kind: "in",
  },
]

const BREAKDOWN = [
  { color: "#5bac8e", name: "居住", amount: "¥3,200", pct: "44%" },
  { color: "#c46a9e", name: "购物", amount: "¥287", pct: "7%" },
  { color: "#4a8fc4", name: "交通", amount: "¥100", pct: "3%" },
  { color: "#e07b3a", name: "餐饮", amount: "¥45", pct: "1%" },
  { color: "#7c6ac4", name: "订阅", amount: "¥11", pct: "<1%" },
]

export function FlowMock() {
  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      <PageHeader>
        <HeadStat label="消费" value="−¥3,843" size="lg" color="var(--red)" />
        <HeadStat label="收入" value="+¥19,300" size="lg" color="var(--accent)" />
        <HeadStat label="净流入" value="+¥15,456" size="lg" />
        <AddBtn>＋ 记一笔</AddBtn>
      </PageHeader>

      <div className="mt-4 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-10">
        {/* 左：筛选 + 流水表 */}
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <span
                key={f}
                className="rounded-[7px] border border-[var(--hair)] bg-[var(--surface-2)] px-[9px] py-[5px] text-[11px] text-[var(--ink-3)]"
              >
                {f}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-[52px_1fr_auto_92px] gap-x-3 border-b border-[var(--hair-2)] pb-2 text-[11px] font-medium text-[var(--ink-4)]">
            <span>日期</span>
            <span>项目</span>
            <span>类别</span>
            <span className="text-right">金额</span>
          </div>
          {TX.map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-[52px_1fr_auto_92px] items-center gap-x-3 border-b border-[var(--hair-3)] py-[9px] text-[12px]"
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] text-[var(--ink-4)]">{t.d}</span>
              <span className="truncate text-[var(--ink)]">{t.name}</span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
                <ColorDot color={t.color} size={7} />
                {t.cat}
              </span>
              <span
                className="text-right font-['IBM_Plex_Mono'] font-medium"
                style={{ color: t.kind === "in" ? "var(--accent)" : "var(--red)" }}
              >
                {t.amt}
              </span>
            </div>
          ))}
        </div>

        {/* 右：支出构成 */}
        <div>
          <div className="mb-4 text-[12px] font-semibold text-[var(--ink-2)]">消费 · 当前筛选</div>
          <Donut
            segments={[
              { color: "#5bac8e", pct: 44 },
              { color: "#c46a9e", pct: 7 },
              { color: "#4a8fc4", pct: 3 },
              { color: "#e07b3a", pct: 1 },
              { color: "#7c6ac4", pct: 1 },
              { color: "#eef1ee", pct: 44 },
            ]}
            centerLabel="消费"
            centerValue="¥3,843"
          />
          <div className="mt-4 flex flex-col gap-[6px]">
            {BREAKDOWN.map((b) => (
              <LegendRow key={b.name} color={b.color} name={b.name} amount={b.amount} pct={b.pct} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
