/**
 * @purpose Site footer with brand blurb and link columns.
 * @role    Landing section: closing navigation and legal/footnote row.
 */

import { Logo, Wrap } from "./primitives"
import { DOWNLOAD_URL, GITHUB_URL } from "@/lib/seo"

const COLS: { h: string; links: { label: string; href: string }[] }[] = [
  {
    h: "产品",
    links: [
      { label: "理念", href: "/#model" },
      { label: "能力", href: "/#features-detail" },
      { label: "隐私", href: "/#privacy" },
      { label: "下载", href: DOWNLOAD_URL },
    ],
  },
  {
    h: "资源",
    links: [
      { label: "使用指南", href: GITHUB_URL },
      { label: "命令行工具 · flowm CLI", href: GITHUB_URL },
      { label: "更新日志", href: "/releases" },
    ],
  },
  {
    h: "关于",
    links: [
      { label: "服务条款", href: GITHUB_URL },
      { label: "隐私政策", href: "/#privacy" },
      { label: "联系我们", href: `${GITHUB_URL}/issues` },
    ],
  },
]

export function Footer() {
  return (
    <footer className="pb-14 pt-11">
      <Wrap className="flex flex-wrap items-start gap-[30px]">
        <div className="max-w-[280px]">
          <div className="flex items-center gap-[9px] text-[17px] font-bold -tracking-[0.01em]">
            <Logo size={24} />
            Flowm
          </div>
          <div className="mt-3 text-[12.5px] leading-[1.6] text-ink-3">
            一台诚实的个人财务仪表。本地优先，只呈现，不替你判断。
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-16">
          {COLS.map((c) => (
            <div key={c.h}>
              <h4 className="mb-[14px] font-lat text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-4">
                {c.h}
              </h4>
              {c.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="block py-[5px] text-[13px] text-ink-2 transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </Wrap>
      <Wrap>
        <div className="mt-[38px] flex items-center gap-4 border-t border-hair-2 pt-[22px] text-[12px] text-ink-4">
          <span>© 2026 Flowm</span>
          <span>·</span>
          <span>数据只在你的设备上</span>
        </div>
      </Wrap>
    </footer>
  )
}
