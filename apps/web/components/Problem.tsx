/**
 * @purpose Problem section: the two pains of personal finance, shown as animated痛点.
 * @role    Landing section after the hero; two cards, each with a problem and an
 *          animated difficulty diagram. No answer here — the solution lives in 「怎么用」.
 * @gotcha  Client component: card ① is a static 4×2 grid of source logos on a grey panel;
 *          card ② endlessly streams new entries in from the top-right (interval + transitions,
 *          honors prefers-reduced-motion).
 */

"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"

/** prefers-reduced-motion 一次性探测。 */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])
  return reduced
}

// ── 卡片①「汇总」：来源各异的 app 图标，排成 4×2 宫格（带灰底、无网格线），体现「来源一大堆」。 ──
const ALIPAY_D =
  "M19.695 15.07c3.426 1.158 4.203 1.22 4.203 1.22V3.846c0-2.124-1.705-3.845-3.81-3.845H3.914C1.808.001.102 1.722.102 3.846v16.31c0 2.123 1.706 3.845 3.813 3.845h16.173c2.105 0 3.81-1.722 3.81-3.845v-.157s-6.19-2.602-9.315-4.119c-2.096 2.602-4.8 4.181-7.607 4.181-4.75 0-6.361-4.19-4.112-6.949.49-.602 1.324-1.175 2.617-1.497 2.025-.502 5.247.313 8.266 1.317a16.796 16.796 0 0 0 1.341-3.302H5.781v-.952h4.799V6.975H4.77v-.953h5.81V3.591s0-.409.411-.409h2.347v2.84h5.744v.951h-5.744v1.704h4.69a19.453 19.453 0 0 1-1.986 5.06c1.424.52 2.702 1.011 3.654 1.333m-13.81-2.032c-.596.06-1.71.325-2.321.869-1.83 1.608-.735 4.55 2.968 4.55 2.151 0 4.301-1.388 5.99-3.61-2.403-1.182-4.438-2.028-6.637-1.809"
const WECHAT_D =
  "M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"
const VISA_D =
  "M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
const PAYPAL_D =
  "M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"

function IconTile({ bg, size, children }: { bg: string; size: number; children: ReactNode }) {
  return (
    <div
      className="grid place-items-center overflow-hidden rounded-[24%] shadow-[0_4px_10px_-6px_rgba(20,40,30,0.45)] ring-1 ring-black/5"
      style={{ width: size, height: size, background: bg }}
    >
      {children}
    </div>
  )
}

type SourceIcon = { key: string; label: string; node: ReactNode }

const ICON_SIZE = 44

const SOURCE_ICONS: SourceIcon[] = [
  {
    key: "alipay",
    label: "支付宝",
    node: (
      <IconTile bg="#ffffff" size={ICON_SIZE}>
        <svg viewBox="0 0 24 24" className="h-full w-full">
          <path fill="#1677FF" d={ALIPAY_D} />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "wechat",
    label: "微信",
    node: (
      <IconTile bg="#07C160" size={ICON_SIZE}>
        <svg viewBox="0 0 24 24" width="60%" height="60%">
          <path fill="#ffffff" d={WECHAT_D} />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "bank",
    label: "银行",
    node: (
      <IconTile bg="#C8102E" size={ICON_SIZE}>
        <svg
          viewBox="0 0 24 24"
          width="58%"
          height="58%"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
        >
          <circle cx="12" cy="12" r="8.5" />
          <rect x="8.5" y="8.5" width="7" height="7" rx="1" />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "broker",
    label: "券商",
    node: (
      <IconTile bg="#15233B" size={ICON_SIZE}>
        <svg viewBox="0 0 24 24" width="62%" height="62%" strokeLinecap="round">
          <line x1="8" y1="5" x2="8" y2="19" stroke="#ef4444" strokeWidth="1.6" />
          <rect x="6.6" y="8" width="2.8" height="6" fill="#ef4444" />
          <line x1="16" y1="4" x2="16" y2="18" stroke="#22c55e" strokeWidth="1.6" />
          <rect x="14.6" y="7" width="2.8" height="7" fill="#22c55e" />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "excel",
    label: "账单",
    node: (
      <IconTile bg="#1E7145" size={ICON_SIZE}>
        <svg viewBox="0 0 24 24" width="56%" height="56%" fill="none">
          <rect x="4" y="3.5" width="16" height="17" rx="2" fill="#ffffff" />
          <path
            d="M9.5 8l5 8M14.5 8l-5 8"
            stroke="#1E7145"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "mastercard",
    label: "信用卡",
    node: (
      <IconTile bg="#ffffff" size={ICON_SIZE}>
        <svg viewBox="0 0 40 24" width="68%" height="68%">
          <circle cx="16" cy="12" r="9.5" fill="#EB001B" />
          <circle cx="24" cy="12" r="9.5" fill="#F79E1B" />
          <path d="M20 4.8a9.5 9.5 0 0 0 0 14.4 9.5 9.5 0 0 0 0-14.4z" fill="#FF5F00" />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "visa",
    label: "Visa",
    node: (
      <IconTile bg="#1A1F71" size={ICON_SIZE}>
        <svg viewBox="0 0 24 24" width="74%" height="74%">
          <path fill="#ffffff" d={VISA_D} />
        </svg>
      </IconTile>
    ),
  },
  {
    key: "paypal",
    label: "PayPal",
    node: (
      <IconTile bg="#ffffff" size={ICON_SIZE}>
        <svg viewBox="0 0 24 24" width="58%" height="58%">
          <path fill="#002991" d={PAYPAL_D} />
        </svg>
      </IconTile>
    ),
  },
]

function SourcesGridViz() {
  return (
    <div className="grid h-[260px] grid-cols-4 grid-rows-2 gap-3 rounded-[12px] bg-surface-2 p-5">
      {SOURCE_ICONS.map((s) => (
        <div key={s.key} className="flex flex-col items-center justify-center gap-2">
          {s.node}
          <span className="text-[10.5px] text-ink-4">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── 卡片②「录入」：流水不断从右上角划入，把下面的列表往下推，无限循环。 ──────────────
const FEED: { name: string; amt: string; c: string }[] = [
  { name: "午餐 · 楼下面馆", amt: "−¥38", c: "#c2873b" },
  { name: "打车 · 滴滴出行", amt: "−¥24", c: "#4a7fb5" },
  { name: "瑞幸咖啡", amt: "−¥19", c: "#8a6db5" },
  { name: "超市 · 永辉", amt: "−¥126", c: "#c2873b" },
  { name: "网易云音乐 年费", amt: "−¥168", c: "#7c6ac4" },
  { name: "高德打车", amt: "−¥31", c: "#4a7fb5" },
  { name: "星巴克", amt: "−¥42", c: "#07c160" },
  { name: "京东 · 日用", amt: "−¥215", c: "#b8412f" },
  { name: "工资", amt: "+¥28,600", c: "#14794a" },
]

const VISIBLE_ROWS = 6

type StreamRow = { key: number; name: string; amt: string; c: string; open: boolean }

function makeRow(feedIdx: number, key: number, open: boolean): StreamRow {
  const f = FEED[feedIdx % FEED.length]
  return { key, name: f.name, amt: f.amt, c: f.c, open }
}

function EntryStreamViz() {
  const reduced = useReducedMotion()
  const [rows, setRows] = useState<StreamRow[]>(() =>
    Array.from({ length: VISIBLE_ROWS }, (_, i) => makeRow(i, i, true)),
  )

  useEffect(() => {
    if (reduced) return
    const feedIdx = { current: VISIBLE_ROWS }
    const keySeq = { current: VISIBLE_ROWS }
    let openTimer: ReturnType<typeof setTimeout>

    const tick = () => {
      const key = keySeq.current++
      const next = makeRow(feedIdx.current++, key, false)
      // 新行先「收起」插到顶部，并裁掉底部溢出的旧行（被遮罩淡出，不会突兀）。
      setRows((prev) => [next, ...prev].slice(0, VISIBLE_ROWS + 1))
      // 下一帧展开：高度 0→1fr 把下方列表推下去，同时从右上角滑入。
      openTimer = setTimeout(() => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, open: true } : r)))
      }, 30)
    }

    const interval = setInterval(tick, 1900)
    return () => {
      clearInterval(interval)
      clearTimeout(openTimer)
    }
  }, [reduced])

  return (
    <div className="relative h-[260px] overflow-hidden rounded-[12px] bg-surface-2 p-5">
      <div
        className="flex flex-col"
        style={{
          maskImage: "linear-gradient(to bottom, #000 80%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 80%, transparent)",
        }}
      >
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid transition-all duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              gridTemplateRows: r.open ? "1fr" : "0fr",
              opacity: r.open ? 1 : 0,
              transform: r.open ? "none" : "translate(20px,-8px)",
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mb-2 flex items-center gap-2.5 rounded-[8px] border border-hair bg-surface px-3 py-2.5">
                <i className="h-2 w-2 flex-none rounded-full" style={{ background: r.c }} />
                <span className="truncate text-[12.5px] text-ink-2">{r.name}</span>
                <span
                  className={`ml-auto font-mono text-[11.5px] tnum ${
                    r.amt.startsWith("+") ? "text-green" : "text-ink"
                  }`}
                >
                  {r.amt}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CARDS: { tag: string; problem: string; viz: ReactNode }[] = [
  {
    tag: "问题一 · 汇总",
    problem: "钱散落在银行、支付宝、微信、券商……来源一大堆，格式还各不相同。",
    viz: <SourcesGridViz />,
  },
  {
    tag: "问题二 · 录入",
    problem: "每天一笔笔手动记流水，又累又琐碎，没几天就坚持不下去。",
    viz: <EntryStreamViz />,
  },
]

export function Problem() {
  return (
    <section id="problem" className="py-[84px]">
      <Wrap>
        <SectionHead tag="问题" title="记账，到底难在哪？">
          钱散落各处难汇总，流水还得天天记——记账真正难的，就是这两件事。
        </SectionHead>
        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
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
              <div className="mt-5">{c.viz}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}
