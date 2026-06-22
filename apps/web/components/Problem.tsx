/**
 * @purpose Problem section: the two pains of personal finance, shown as pure痛点.
 * @role    Landing section after the hero; two cards, each with a problem and a
 *          difficulty diagram. No answer/solution here — the solution lives in 「怎么用」.
 */

import type { ReactNode } from "react"
import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"

/** 汇总难点：来源散落、格式各异，连接断裂，凑不出一个全貌。 */
function ScatterViz() {
  const sources = [
    { name: "银行", fmt: ".pdf", off: "0%", color: "#3a7ca5" },
    { name: "支付宝", fmt: ".csv", off: "32%", color: "#1677ff" },
    { name: "微信", fmt: ".xlsx", off: "10%", color: "#2aa758" },
    { name: "券商", fmt: ".pdf", off: "44%", color: "#c98a2a" },
    { name: "信用卡", fmt: ".csv", off: "20%", color: "#b8412f" },
  ]
  return (
    <div className="rounded-[12px] bg-surface-2 p-5">
      <div className="flex flex-col gap-2">
        {sources.map((s) => (
          <div
            key={s.name}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-hair bg-surface px-3 py-1.5"
            style={{ marginLeft: s.off }}
          >
            <i className="h-2 w-2 flex-none rounded-full" style={{ background: s.color }} />
            <span className="text-[12px] font-medium text-ink-2">{s.name}</span>
            <span className="font-mono text-[10px] text-ink-4">{s.fmt}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid place-items-center rounded-[10px] border border-dashed border-ink-5 py-2.5 text-[12px] text-ink-4">
        全貌？
      </div>
      <div className="mt-3.5 text-center text-[11.5px] text-ink-4">
        来源各异、格式不一——光凑齐就够呛
      </div>
    </div>
  )
}

/** 录入难点：一笔笔手输，打卡没几天就断了。 */
function ToilViz() {
  const days = ["1", "2", "3", "4", "5", "6", "7"]
  return (
    <div className="flex flex-col gap-3 rounded-[12px] bg-surface-2 p-5">
      {/* 重复的手动条目 */}
      <div className="flex flex-col gap-1.5">
        {["午餐 −¥38", "打车 −¥24", "咖啡 −¥32"].map((t) => (
          <div
            key={t}
            className="flex items-center justify-between rounded-[8px] border border-hair bg-surface px-3 py-1.5"
          >
            <span className="text-[12px] text-ink-2">{t}</span>
            <span className="font-mono text-[10.5px] text-ink-4">手动输入</span>
          </div>
        ))}
      </div>
      {/* 打卡：第 3 天后中断 */}
      <div className="flex items-center gap-1.5">
        {days.map((d, i) => {
          const done = i < 3
          return (
            <div
              key={d}
              className={`grid h-6 w-6 place-items-center rounded-[6px] text-[10.5px] ${
                done
                  ? "bg-green-soft font-semibold text-green"
                  : "border border-dashed border-hair text-ink-5"
              }`}
            >
              {done ? "✓" : d}
            </div>
          )
        })}
      </div>
      <div className="text-center text-[11.5px] text-ink-4">一笔笔手输，没几天就断了</div>
    </div>
  )
}

const CARDS: { tag: string; problem: string; viz: ReactNode }[] = [
  {
    tag: "问题一 · 汇总",
    problem: "钱散落在银行、支付宝、微信、券商……来源一大堆，格式还各不相同。",
    viz: <ScatterViz />,
  },
  {
    tag: "问题二 · 录入",
    problem: "每天一笔笔手动记流水，又累又琐碎，没几天就坚持不下去。",
    viz: <ToilViz />,
  },
]

export function Problem() {
  return (
    <section id="problem" className="py-[84px]">
      <Wrap>
        <SectionHead tag="问题" title="记账，到底难在哪？">
          钱散落各处难汇总，流水还得天天记——记账真正难的，就是这两件事。
        </SectionHead>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {CARDS.map((c) => (
            <div
              key={c.tag}
              className="flex flex-col rounded-[16px] border border-hair bg-surface p-7"
            >
              <div className="font-lat text-[11px] font-semibold uppercase tracking-[0.14em] text-amber">
                {c.tag}
              </div>
              <p className="mt-3 text-[16px] font-semibold leading-[1.55] -tracking-[0.01em] text-ink">
                {c.problem}
              </p>
              <div className="mt-5 flex flex-1 flex-col">{c.viz}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}
