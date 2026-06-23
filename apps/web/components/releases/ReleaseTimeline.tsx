/**
 * @purpose Render the public release timeline and expose release note data.
 * @role    Marketing-site changelog source; release automation validates the first entry before tagging.
 * @gotcha  Before running `pnpm release <version>`, add the new entry first and move `badge: "latest"` to it.
 */

export type ReleaseGroup = {
  title: string
  items: string[]
}

export type ReleaseNote = {
  version: string
  date: string
  head: string
  badge?: "latest"
  groups: ReleaseGroup[]
}

export const RELEASES: ReleaseNote[] = [
  {
    version: "0.1.0",
    date: "2026-06-23",
    head: "FlowM 桌面端和本地优先财务模型的第一版公开发布。",
    badge: "latest",
    groups: [
      {
        title: "桌面应用",
        items: ["内置演示账本和个人账本", "支持流水、资产、订阅、贷款和预算视图"],
      },
      {
        title: "网站",
        items: ["上线静态营销页", "支持 Cloudflare Pages 部署和基础 SEO 元数据"],
      },
    ],
  },
  {
    version: "0.0.9",
    date: "2026-06-18",
    head: "补齐 FlowM 网站预览、SEO 和静态部署能力，为公开下载页做准备。",
    groups: [
      {
        title: "网站",
        items: ["新增产品预览 mock", "补齐 sitemap、robots、manifest 和结构化数据"],
      },
      {
        title: "发布",
        items: ["支持 Next.js 静态导出", "接入 Cloudflare Pages 部署流程"],
      },
    ],
  },
  {
    version: "0.0.8",
    date: "2026-06-12",
    head: "把资产、流水、贷款和订阅拆成独立视图，强化非对账式财务模型。",
    groups: [
      {
        title: "桌面应用",
        items: ["新增资产总览和账户快照", "优化流水表格的筛选和查看体验"],
      },
      {
        title: "模型",
        items: ["明确贷款计划只作为未来视图", "净资产只来自资产负债快照"],
      },
    ],
  },
  {
    version: "0.0.7",
    date: "2026-06-05",
    head: "完成演示账本和本地优先数据链路，方便首次打开就能看到完整产品状态。",
    groups: [
      {
        title: "体验",
        items: ["内置演示账本", "新增首页指标、趋势和近期流水"],
      },
      {
        title: "基础设施",
        items: ["打通 Electron、React 和 tRPC IPC", "整理 SQLite/Drizzle 数据访问边界"],
      },
    ],
  },
]

export function ReleaseTimeline() {
  return (
    <div className="flex flex-col gap-5">
      {RELEASES.map((release) => (
        <article key={release.version} className="rounded-[14px] border border-hair bg-surface p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-[22px] font-semibold text-ink">v{release.version}</h2>
            {release.badge ? (
              <span className="rounded-full bg-green-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-green">
                {release.badge}
              </span>
            ) : null}
            <time className="ml-auto font-mono text-[12px] text-ink-4" dateTime={release.date}>
              {release.date}
            </time>
          </div>
          <p className="mt-3 text-[15px] leading-[1.7] text-ink-2">{release.head}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {release.groups.map((group) => (
              <section key={group.title}>
                <h3 className="text-[13px] font-semibold text-ink">{group.title}</h3>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-[1.65] text-ink-2">
                  {group.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
