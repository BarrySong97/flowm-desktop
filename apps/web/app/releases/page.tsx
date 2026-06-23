/**
 * @purpose Public release notes page for FlowM.
 * @role    Marketing route that renders the release timeline used by release automation.
 * @deps    ReleaseTimeline component and shared layout primitives.
 */

import { Footer } from "@/components/Footer"
import { Nav } from "@/components/Nav"
import { Wrap } from "@/components/primitives"
import { ReleaseTimeline } from "@/components/releases/ReleaseTimeline"
import { DOWNLOAD_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "更新日志",
  description: `查看 ${SITE_NAME} 的版本更新记录、桌面端变更和下载入口。${SITE_DESCRIPTION}`,
  alternates: {
    canonical: "/releases",
  },
  openGraph: {
    title: `${SITE_NAME} 更新日志`,
    description: "Flowm 版本更新记录、桌面端变更和 GitHub Release 下载入口。",
    url: `${SITE_URL}/releases`,
  },
}

export default function ReleasesPage() {
  return (
    <>
      <Nav />
      <main className="py-[84px]">
        <Wrap>
          <div className="max-w-[620px]">
            <div className="font-lat text-[11px] font-semibold uppercase tracking-[0.16em] text-green">
              Releases
            </div>
            <h1 className="mt-[14px] text-[clamp(30px,4vw,46px)] font-bold leading-[1.12] -tracking-[0.025em]">
              更新日志
            </h1>
            <p className="mt-[18px] text-[15.5px] leading-[1.7] text-ink-2">
              每个版本只记录对用户有意义的变化。发版前，先在这里写好新版本条目。
            </p>
            <a
              href={DOWNLOAD_URL}
              className="mt-7 inline-flex items-center gap-[7px] rounded-[12px] bg-green px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(20,121,74,0.25)] transition-all hover:-translate-y-px hover:bg-green-deep hover:shadow-[0_6px_16px_-6px_rgba(20,121,74,0.5)]"
            >
              到 GitHub Release 下载
            </a>
          </div>
          <div className="mt-12">
            <ReleaseTimeline />
          </div>
        </Wrap>
      </main>
      <Footer />
    </>
  )
}
