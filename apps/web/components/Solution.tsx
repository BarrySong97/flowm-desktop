/**
 * @purpose 解答 section: the answer to the three pains, placed right after 问题.
 * @role    Landing section between Problem and 核心理念. Two beats — drop your
 *          statements into one folder, then give an AI Agent one prompt — and 汇总/
 *          录入/对账 are all handled. The detailed step flow lives later in 「怎么用」.
 */

import { OpenAiIcon } from "./BrandIcons"
import { Wrap } from "./primitives"
import { SectionHead } from "./SectionHead"

const FILES: { name: string; ext: string; c: string }[] = [
  { name: "支付宝账单", ext: ".csv", c: "#1677ff" },
  { name: "微信账单", ext: ".xlsx", c: "#07c160" },
  { name: "招行流水", ext: ".pdf", c: "#c8102e" },
  { name: "券商交割单", ext: ".pdf", c: "#15233b" },
]

const RESULT = ["6 个来源已汇总", "142 笔已入账", "三层各自记好，不用对账"]

function FileIcon({ color }: { color: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
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

function Check() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none text-green"
      aria-hidden
    >
      <path d="M3 8.5l3.2 3.2L13 4.5" />
    </svg>
  )
}

/** ① 把各处账单丢进一个文件夹。 */
function FolderStep() {
  return (
    <div className="flex flex-col rounded-[16px] border border-hair bg-surface p-6">
      <StepHead n="1" title="把账单丢进一个文件夹" />
      <div className="mt-5 flex flex-1 flex-col gap-2.5 rounded-[12px] bg-surface-2 p-5">
        <div className="mb-1 flex items-center gap-2 text-[12px] text-ink-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber"
            aria-hidden
          >
            <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.2h9A1.5 1.5 0 0 1 21 8.7V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17z" />
          </svg>
          <span className="font-mono">~/账单</span>
        </div>
        {FILES.map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-2.5 rounded-[8px] border border-hair bg-surface px-3 py-2"
          >
            <FileIcon color={f.c} />
            <span className="text-[12.5px] text-ink-2">{f.name}</span>
            <span className="ml-auto font-mono text-[11px] text-ink-4">{f.ext}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** ② 给 Agent 一句话，它把三件事都办了。 */
function PromptStep() {
  return (
    <div className="flex flex-col rounded-[16px] border border-hair bg-surface p-6">
      <StepHead n="2" title="给 Agent 一句话" />
      <div className="mt-5 flex flex-1 flex-col gap-3 rounded-[12px] bg-surface-2 p-5">
        <div className="max-w-[90%] self-end rounded-[14px] rounded-br-[4px] border border-hair bg-surface px-3.5 py-2.5 text-[13px] leading-snug text-ink">
          帮我把 <span className="font-mono text-[12px] text-ink-2">~/账单</span> 里的都记进账本
        </div>
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 flex-none place-items-center rounded-full border border-hair bg-surface text-ink">
            <OpenAiIcon />
          </div>
          <div className="min-w-0 flex-1 rounded-[14px] rounded-tl-[4px] border border-hair bg-surface px-3.5 py-3">
            <div className="mb-2 text-[12.5px] text-ink-2">好，都办好了：</div>
            <div className="flex flex-col gap-1.5">
              {RESULT.map((r) => (
                <div key={r} className="flex items-center gap-2 text-[12.5px] text-ink">
                  <Check />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-green-soft font-mono text-[12px] font-semibold text-green">
        {n}
      </span>
      <span className="text-[15px] font-semibold -tracking-[0.01em] text-ink">{title}</span>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center justify-center py-1 text-ink-4 md:py-0">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="rotate-90 md:rotate-0"
        aria-hidden
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

export function Solution() {
  return (
    <section id="solution" className="py-[84px]">
      <Wrap>
        <SectionHead tag="解答" title="其实，只要两步">
          三个麻烦，一个动作解决：把各处账单丢进一个文件夹，再给 AI Agent
          一句话——汇总、记账、对账，它全包了。
        </SectionHead>
        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <FolderStep />
          <Arrow />
          <PromptStep />
        </div>
      </Wrap>
    </section>
  )
}
