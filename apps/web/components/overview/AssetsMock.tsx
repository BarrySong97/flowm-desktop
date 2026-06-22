/**
 * @purpose Static mock of the desktop 资产 (assets) page.
 * @role    One of the swappable pages inside the hero app window.
 */

import { AddBtn, Donut, HeadStat, LegendRow, PageHeader } from "./pageparts"
import { Kicker, SectionTitle } from "./atoms"

type AssetRow = {
  name: string
  note: string
  amt: string
  chg: string
  up?: boolean
  liab?: boolean
}

const GROUPS: { name: string; rows: AssetRow[] }[] = [
  {
    name: "现金",
    rows: [
      { name: "中国银行", note: "银行", amt: "¥245,680", chg: "+2.3%", up: true },
      { name: "支付宝", note: "钱包", amt: "¥18,920", chg: "−1.5%", up: false },
      { name: "现金盒", note: "现金", amt: "¥2,500", chg: "" },
    ],
  },
  {
    name: "投资",
    rows: [
      { name: "雪球港股账户", note: "股票", amt: "¥520,340", chg: "+5.8%", up: true },
      { name: "天天基金", note: "基金", amt: "¥180,550", chg: "+1.2%", up: true },
      { name: "币安账户", note: "数字资产", amt: "¥42,680", chg: "−3.4%", up: false },
    ],
  },
  {
    name: "不动产",
    rows: [{ name: "北京朝阳区公寓", note: "不动产", amt: "¥2,800,000", chg: "" }],
  },
  {
    name: "负债",
    rows: [
      { name: "房贷", note: "负债", amt: "−¥1,200,000", chg: "", liab: true },
      { name: "信用卡欠款", note: "负债", amt: "−¥3,500", chg: "", liab: true },
    ],
  },
]

const COMPOSITION = [
  { color: "#5bac8e", name: "不动产", amount: "¥2,800,000", pct: "68%" },
  { color: "#4a8fc4", name: "投资", amount: "¥743,570", pct: "18%" },
  { color: "#3d9d8f", name: "固定资产", amount: "¥328,000", pct: "8%" },
  { color: "#e07b3a", name: "现金", amount: "¥267,101", pct: "6%" },
]

export function AssetsMock() {
  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      <PageHeader>
        <div>
          <Kicker className="mb-1.5">资产 · 现在有多少钱</Kicker>
          <div className="font-['IBM_Plex_Mono'] text-[40px] font-semibold leading-none tracking-[-0.03em] text-[var(--ink)]">
            <span className="mr-1 text-[18px] font-normal text-[var(--ink-3)]">¥</span>4,138,670
          </div>
        </div>
        <HeadStat label="流动资产" value="¥267,101" />
        <HeadStat label="负债" value="¥1,203,500" color="var(--red)" />
        <HeadStat label="账户数" value="10" />
        <AddBtn>＋ 添加账户</AddBtn>
      </PageHeader>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-10">
        {/* 左：分组资产列表 */}
        <div>
          {GROUPS.map((g) => (
            <div key={g.name}>
              <div className="px-1 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-4)]">
                {g.name}
              </div>
              {g.rows.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-[10px] border-b border-[var(--hair-3)] px-1.5 py-[10px]"
                >
                  <div className="w-[160px] flex-none">
                    <div className="text-[13px] font-medium text-[var(--ink)]">{r.name}</div>
                    <div className="mt-px text-[10.5px] text-[var(--ink-4)]">{r.note}</div>
                  </div>
                  <div className="flex-1" />
                  <div className="text-right">
                    <div
                      className="font-['IBM_Plex_Mono'] text-[14px] font-medium"
                      style={{ color: r.liab ? "var(--red)" : "var(--ink)" }}
                    >
                      {r.amt}
                    </div>
                    {r.chg ? (
                      <div
                        className="mt-px text-[10.5px]"
                        style={{ color: r.up ? "var(--accent)" : "var(--red)" }}
                      >
                        {r.chg}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 右：资产构成 */}
        <div>
          <div className="mb-3 flex items-baseline">
            <SectionTitle>资产构成</SectionTitle>
            <span className="ml-auto text-[10.5px] text-[var(--ink-4)]">面积 = 占总资产比例</span>
          </div>
          <Donut
            segments={COMPOSITION.map((c) => ({ color: c.color, pct: parseFloat(c.pct) }))}
            centerLabel="总资产"
            centerValue="¥4.14M"
          />
          <div className="mt-4 flex flex-col gap-[6px]">
            {COMPOSITION.map((c) => (
              <LegendRow key={c.name} color={c.color} name={c.name} amount={c.amount} pct={c.pct} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
