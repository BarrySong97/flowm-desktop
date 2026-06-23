/**
 * @purpose Above-the-fold hero with headline, CTAs, and the app mock window.
 * @role    Landing section; fits within one viewport with a fixed-height,
 *          internally-scrolling app preview below the centered copy.
 */

import { AppMock } from "./overview/AppMock"
import { CopyCommand } from "./CopyCommand"
import { DOWNLOAD_URL } from "@/lib/seo"

export function Hero() {
  return (
    <header className="mx-auto flex h-[calc((100dvh-62px)*1.55+80px)] max-w-[1320px] flex-col px-[22px] pb-14 pt-[132px] max-lg:h-auto max-lg:pb-12">
      {/* 文案 */}
      <div className="flex-none text-center">
        <h1 className="text-[clamp(30px,4vw,46px)] font-bold leading-[1.1] -tracking-[0.03em]">
          只导入，不录入
          <br />
          <span className="text-ink-4">只记录，不对账</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-[clamp(14px,1.5vw,17px)] leading-[1.65] text-ink-2">
          把账单交给
          AI，用命令行直接写进本地账本——不用再手动记账。账户、流水、订阅、负债各自记下，也不必对平。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-[13px]">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center gap-[7px] rounded-[12px] bg-green px-6 py-[12px] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(20,121,74,0.25)] transition-all hover:-translate-y-px hover:bg-green-deep hover:shadow-[0_6px_16px_-6px_rgba(20,121,74,0.5)]"
          >
            免费开始
          </a>
          <a
            href="#model"
            className="inline-flex items-center gap-[7px] rounded-[12px] border border-hair bg-surface px-6 py-[12px] text-[15px] font-semibold text-ink transition-colors hover:border-ink-5 hover:bg-surface-2"
          >
            看看怎么用
          </a>
        </div>
        {/* 复制这句话，发给任意 AI Agent 即可开始 */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-[12.5px] text-ink-3">或，把这句话复制给你常用的 AI Agent：</span>
          <CopyCommand text="阅读 github.com/flowm/flowm，帮我开始用 Flowm 记账" />
        </div>
      </div>

      {/* App mock：固定高度、内部滚动，可点击底部导航切换页面 */}
      <div className="mt-8 min-h-0 w-full flex-1 max-lg:mt-10 max-lg:h-[900px] max-lg:flex-none">
        <AppMock />
      </div>
    </header>
  )
}
