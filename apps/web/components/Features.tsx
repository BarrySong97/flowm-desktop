/**
 * @purpose 「怎么用」section: a plain-language step flow + an Agent conversation diagram.
 * @role    Landing section showing how data gets into Flowm — via an AI Agent, no commands.
 */

import { AgentIcon } from "./BrandIcons"
import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"

const STEPS: { t: string; d: string }[] = [
  { t: "下载并打开 Flowm", d: "装好桌面应用，打开它。" },
  { t: "打开你常用的 Agent", d: "Codex、Claude Code，或其他类似应用都行。" },
  { t: "把 Flowm 的 GitHub 地址复制过去", d: "它读一下，就知道该怎么操作。" },
  { t: "把流水文件交给它", d: "从微信、支付宝等导出，丢给它，它帮你记进账本。" },
  { t: "其余的也交给它", d: "要加预算、订阅、贷款，说一句话就行。" },
]

function GithubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5z" />
      <path d="M9 1.5V5.5H13" />
    </svg>
  )
}

function Steps() {
  return (
    <ol className="flex flex-col gap-5 rounded-[16px] border border-hair bg-surface p-7">
      {STEPS.map((s, i) => (
        <li key={s.t} className="flex items-start gap-3.5">
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-green-soft font-mono text-[13px] font-semibold text-green">
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold -tracking-[0.01em] text-ink">{s.t}</div>
            <div className="mt-1 text-[13px] leading-[1.6] text-ink-2">{s.d}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** 对话示意图：用户把 GitHub 地址 + 流水文件交给 Agent，Agent 口语化代办。 */
function HowToChat() {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-hair bg-surface-2 p-6">
      {/* 用户：地址 + 流水文件 */}
      <div className="max-w-[90%] self-end rounded-[14px] rounded-br-[4px] border border-hair bg-surface px-3.5 py-2.5">
        <div className="text-[13px] leading-snug text-ink">
          帮我记一下账，这是 Flowm 的地址和我导出的账单：
        </div>
        <div className="mt-2 flex flex-col items-start gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-ink-2">
            <GithubIcon /> github.com/flowm/flowm
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-surface-2 px-2.5 py-1.5 text-[11px] text-ink-2">
            <FileIcon /> 支付宝账单-2026-06.csv
          </span>
        </div>
      </div>
      {/* Agent：中立 AI Agent 头像，口语化回复 */}
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-green-soft text-green">
          <AgentIcon />
        </div>
        <div className="min-w-0 flex-1 rounded-[14px] rounded-tl-[4px] border border-hair bg-surface px-3.5 py-2.5 text-[13px] leading-[1.6] text-ink">
          好，6 月的 142 笔都记进账本了 👍 顺手把
          <span className="font-medium text-green">预算、订阅和贷款</span>也一并更新好啦。
        </div>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="py-[84px]">
      <Wrap>
        <SectionHead tag="怎么用" title="把活儿交给 AI Agent">
          不用学命令、不用配置——把地址和账单交给 Agent，它替你录入，预算、订阅、贷款也一并打理。
        </SectionHead>
        <div className="mt-12 grid items-start gap-6 md:grid-cols-2">
          <Steps />
          <HowToChat />
        </div>
      </Wrap>
    </section>
  )
}
