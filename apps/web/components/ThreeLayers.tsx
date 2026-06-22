/**
 * @purpose Three-layer data model section (past / present / future).
 * @role    Landing section explaining Flowm's asymmetric finance model.
 */

import type { ReactNode } from "react"
import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"
import { UpcomingRow } from "./overview/atoms"

const PAST_BARS = [34, 70, 22, 90, 48, 30, 64, 18, 52, 78, 40, 26]

// 即将扣费（订阅 + 贷款），与 Overview 首页的「即将扣费」列表一致。
const UPCOMING = [
  { date: "06-06", color: "#7c6ac4", name: "爱奇艺", kind: "订阅", amount: "¥25" },
  { date: "06-12", color: "#ad7c2c", name: "招商银行 房贷", kind: "贷款", amount: "¥9,850" },
  { date: "06-18", color: "#7c6ac4", name: "网易云音乐", kind: "订阅", amount: "¥168" },
]

function Stats({ items }: { items: { l: string; v: string; c?: string }[] }) {
  return (
    <div className="mt-[18px] flex gap-6">
      {items.map((s) => (
        <div key={s.l}>
          <div className="text-[10.5px] text-ink-4">{s.l}</div>
          <div
            className="mt-1 whitespace-nowrap font-mono text-[13.5px] font-medium tnum"
            style={s.c ? { color: s.c } : undefined}
          >
            {s.v}
          </div>
        </div>
      ))}
    </div>
  )
}

function PastBars() {
  return (
    <div className="flex h-24 items-end gap-1">
      {PAST_BARS.map((h, i) => (
        <i
          key={i}
          className="flex-1 rounded-t-[2px] bg-teal opacity-[0.82]"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

function PresentArea() {
  return (
    <svg width="100%" height="96" viewBox="0 0 200 96" preserveAspectRatio="none">
      <path
        d="M0 78 L28 70 L56 74 L84 50 L112 56 L140 30 L168 37 L200 15 L200 96 L0 96 Z"
        fill="#e7f3eb"
      />
      <path
        d="M0 78 L28 70 L56 74 L84 50 L112 56 L140 30 L168 37 L200 15"
        fill="none"
        stroke="#14794a"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function UpcomingList() {
  return (
    <div>
      {UPCOMING.map((u) => (
        <UpcomingRow
          key={u.date}
          date={u.date}
          color={u.color}
          name={u.name}
          kind={u.kind}
          amount={u.amount}
        />
      ))}
    </div>
  )
}

function Layer({
  barColor,
  title,
  tag,
  desc,
  stats,
  chart,
}: {
  barColor: string
  title: string
  tag: string
  desc: string
  stats: { l: string; v: string; c?: string }[]
  chart: ReactNode
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[16px] border border-hair bg-surface p-[28px_26px] transition-all hover:-translate-y-[3px] hover:shadow-[0_20px_40px_-22px_rgba(20,40,30,0.28)]">
      <div className="mb-5 h-[6px] w-[56px] rounded-[4px]" style={{ background: barColor }} />
      <h3 className="text-[18px] font-semibold -tracking-[0.01em]">{title}</h3>
      <div className="mt-[3px] font-mono text-[11px] tracking-[0.02em] text-ink-4">{tag}</div>
      <p className="mt-[14px] text-[13.5px] leading-[1.65] text-ink-2">{desc}</p>
      <Stats items={stats} />
      <div className="mt-auto pt-[22px]">{chart}</div>
    </div>
  )
}

export function ThreeLayers() {
  return (
    <section id="model" className="bg-surface py-[84px]">
      <Wrap>
        <SectionHead tag="核心理念" title="三层数据，拒绝对账">
          Flowm
          把数据分成过去、当前、未来三层，各自独立、互不干扰。我们不让它们对齐——流水、余额、预测本来就对不平，强行对账只是骗自己。
        </SectionHead>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Layer
            barColor="#1b9e8e"
            title="过去 · 流水"
            tag="你花过、挣过的记录"
            desc="只读的真实轨迹，不可修改。不拿它去推算你现在有多少钱。"
            stats={[
              { l: "本月支出", v: "−¥19,908", c: "#161e19" },
              { l: "本月收入", v: "+¥28,600", c: "#14794a" },
              { l: "本月结余", v: "+¥8,692", c: "#14794a" },
            ]}
            chart={<PastBars />}
          />
          <Layer
            barColor="#14794a"
            title="当前 · 余额"
            tag="你手动维护的快照"
            desc="它就是此刻的净值，不靠流水累加推出来。你说多少就是多少。"
            stats={[
              { l: "总资产", v: "¥4,504,431" },
              { l: "净资产", v: "¥2,684,431" },
              { l: "负债", v: "¥1,820,000" },
            ]}
            chart={<PresentArea />}
          />
          <Layer
            barColor="#c98a2a"
            title="未来 · 预测"
            tag="已知的订阅与贷款"
            desc="是提醒，不是承诺——还没发生，不计入你现在的净值。"
            stats={[
              { l: "未来 30 天待扣", v: "¥10,043" },
              { l: "每月固定", v: "¥10,018" },
            ]}
            chart={<UpcomingList />}
          />
        </div>
      </Wrap>
    </section>
  )
}
