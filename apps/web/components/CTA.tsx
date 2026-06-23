/**
 * @purpose Closing download call-to-action.
 * @role    Landing section: macOS / iOS download buttons and platform notes.
 */

import { Wrap } from "./primitives"
import { DOWNLOAD_URL, GITHUB_URL } from "@/lib/seo"

const APPLE = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11 1c.1 1-.3 2-1 2.7-.6.7-1.6 1.2-2.5 1.1-.1-1 .4-2 1-2.6C9.2 1.5 10.2 1 11 1zM13 11.5c-.4 1-.6 1.4-1.1 2.2-.7 1.2-1.7 2.6-3 2.6-1.1 0-1.4-.7-2.9-.7s-1.9.7-2.9.7c-1.3 0-2.2-1.3-3-2.4C-.6 10.7-.9 6.7 1.2 4.7 2 4 3 3.5 4 3.5c1.1 0 1.8.7 2.7.7.9 0 1.4-.7 2.7-.7.9 0 1.9.5 2.6 1.3-2.3 1.3-1.9 4.6.9 5.7z" />
  </svg>
)

export function CTA() {
  return (
    <section id="download" className="pb-24 pt-8">
      <Wrap>
        <div className="text-center">
          <h2 className="text-[clamp(26px,3.4vw,38px)] font-bold -tracking-[0.025em]">
            今天就开始看清
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-[1.65] text-ink-2">
            免费、本地、无需注册。导入一份账单，几分钟就能看到你钱的全貌。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-[13px]">
            <a
              href={DOWNLOAD_URL}
              className="inline-flex items-center gap-[7px] rounded-[12px] bg-green px-6 py-[13px] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(20,121,74,0.25)] transition-all hover:-translate-y-px hover:bg-green-deep hover:shadow-[0_6px_16px_-6px_rgba(20,121,74,0.5)]"
            >
              下载 macOS 版
            </a>
            <a
              href={GITHUB_URL}
              className="inline-flex items-center gap-[7px] rounded-[12px] border border-hair bg-surface px-6 py-[13px] text-[15px] font-semibold text-ink transition-colors hover:border-ink-5 hover:bg-surface-2"
            >
              查看开源项目
            </a>
          </div>
          <div className="mt-7 flex justify-center gap-[22px] text-[12px] text-ink-4">
            <span className="inline-flex items-center gap-[6px]">{APPLE}macOS 12+</span>
            <span className="inline-flex items-center gap-[6px]">{APPLE}iOS 16+</span>
            <span>· 简体中文</span>
          </div>
        </div>
      </Wrap>
    </section>
  )
}
