/**
 * @purpose 「怎么用」section: a plain-language step flow + an Agent conversation diagram.
 * @role    Landing section showing how data gets into Flowm — via an AI Agent, no commands.
 */

import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"

const STEPS: { t: string; d: string }[] = [
  { t: "下载并打开 Flowm", d: "装好桌面应用，打开它。" },
  { t: "打开你常用的 Agent", d: "Codex、Claude Code，或其他类似应用都行。" },
  { t: "把 Flowm 的 GitHub 地址复制过去", d: "它读一下，就知道该怎么操作。" },
  { t: "把流水文件交给它", d: "从微信、支付宝等导出，丢给它，它帮你记进账本。" },
  { t: "其余的也交给它", d: "要加预算、订阅、贷款，说一句话就行。" },
]

function OpenAiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.911 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.998-2.9 6.056 6.056 0 0 0-.748-7.073zm-9.022 12.608a4.476 4.476 0 0 1-2.876-1.04l.142-.081 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.495 4.494zm-9.66-4.125a4.471 4.471 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.499 4.499 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973v5.677a.766.766 0 0 0 .388.677l5.815 3.354-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.834-3.388L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.062l4.83-2.787a4.499 4.499 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.499 4.499 0 0 1 7.376-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.098-2.366 2.602-1.5 2.607 1.5v2.999l-2.598 1.5-2.607-1.5z" />
    </svg>
  )
}

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
      {/* Agent：OpenAI 头像，口语化回复 */}
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 flex-none place-items-center rounded-full border border-hair bg-surface text-ink">
          <OpenAiIcon />
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
