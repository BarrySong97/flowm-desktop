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
    version: "0.1.12",
    date: "2026-08-07",
    head: "订阅预测改为直接根据计划实时生成，真实扣款只由绑定流水记录。",
    badge: "latest",
    groups: [
      {
        title: "订阅",
        items: [
          "未来扣费不再预先写入数据库，而是根据订阅计划的周期和起始日期实时展示",
          "修改订阅金额、周期或日期后，首页和订阅页会立即使用新的预测结果",
          "实际扣款金额只统计已绑定的真实流水，并与未来计划明确分开展示",
          "月末订阅保持原始日期锚点，不会经过二月后永久漂移到每月 28 日",
        ],
      },
    ],
  },
  {
    version: "0.1.11",
    date: "2026-08-04",
    head: "让订阅和贷款预测按滚动窗口自动补齐，旧订阅也能持续出现在即将扣费中。",
    groups: [
      {
        title: "订阅和贷款",
        items: [
          "打开 FlowM 或跨过本地日期后，自动补齐 active 订阅和贷款未来 60 天的预测记录",
          "按计划和到期日幂等生成，不重复创建预测，也不创建真实流水或修改资产快照",
        ],
      },
    ],
  },
  {
    version: "0.1.10",
    date: "2026-08-04",
    head: "修复首页贷款欠款进度和未来扣费展示，让首页计划信息与实际日期保持一致。",
    groups: [
      {
        title: "首页",
        items: [
          "贷款欠款会随着还款到期日推进而减少，不再长期显示初始欠款",
          "即将扣费按未来 30 天完整统计，首页展示前 5 条并可进入订阅页查看全部",
        ],
      },
    ],
  },
  {
    version: "0.1.9",
    date: "2026-07-27",
    head: "贷款还款进度改为按期次日期自动推进，并与可选的真实扣款流水彻底解耦。",
    groups: [
      {
        title: "贷款",
        items: [
          "到达还款日期后自动推进已还期数、进度比例和预计剩余本金",
          "日期推进不会生成流水、修改资产快照或改变数据库中的预测状态",
          "扣款流水仍可手动绑定和解绑，仅用于追溯真实付款，不参与还款进度计算",
        ],
      },
      {
        title: "桌面应用",
        items: [
          "打开账本时自动补齐近期贷款预测期次",
          "跨过本地日期边界后自动刷新贷款进度，无需重启应用",
        ],
      },
    ],
  },
  {
    version: "0.1.8",
    date: "2026-07-22",
    head: "补齐结余分析的返回体验，并让桌面端支持鼠标侧键和系统手势前进后退。",
    groups: [
      {
        title: "桌面应用",
        items: [
          "从看板或流水进入结余分析后，可通过页内返回按钮回到原页面并保留筛选状态",
          "支持 macOS 鼠标侧键、浏览器快捷键与触控板手势进行路由前进后退",
          "支持 Windows 和 Linux 的鼠标浏览器前进后退命令",
        ],
      },
    ],
  },
  {
    version: "0.1.7",
    date: "2026-07-08",
    head: "修复首页净资产趋势的月度计算口径，让资产快照按月末最近余额延续。",
    groups: [
      {
        title: "桌面应用",
        items: [
          "首页右上角净资产趋势改为按每个月月末的最近资产快照计算",
          "未在当月更新的资产账户会沿用最近已知余额，避免趋势点漏算账户",
          "近 12 个月净资产变化在下降时会正确显示负号和红色状态",
        ],
      },
    ],
  },
  {
    version: "0.1.6",
    date: "2026-07-08",
    head: "预算进入新月份时会提示从最近一期复制生成本月计划，命令行也补齐了订阅和贷款计划管理。",
    groups: [
      {
        title: "桌面应用",
        items: [
          "首页和预算页会在本月没有预算时提示从最近一期预算生成本月计划",
          "生成预算只复制计划项、金额、颜色和分类范围，已用金额仍按本月真实流水计算",
          "用户选择暂不生成后，本月不会反复自动弹窗打扰",
        ],
      },
      {
        title: "命令行",
        items: [
          "新增订阅计划的查询、创建、更新、取消和预测 occurrence 命令",
          "新增贷款计划的查询、创建、更新、关闭和预测 occurrence 命令",
          "新增 future-pressure 命令查看订阅和贷款的未来固定压力",
        ],
      },
    ],
  },
  {
    version: "0.1.4",
    date: "2026-06-30",
    head: "订阅和贷款可以绑定真实流水作为扣款记录，命令行也补齐了对应能力。",
    groups: [
      {
        title: "桌面应用",
        items: [
          "订阅和贷款详情新增「扣款流水」入口，右侧抽屉展示已绑定的扣款流水并可解绑",
          "手动添加弹窗复用流水列表的完整筛选，勾选即可批量绑定",
          "绑定仅用于追溯实际扣款，不影响订阅/贷款的计划与统计",
        ],
      },
      {
        title: "命令行",
        items: [
          "新增 list-linked-cashflow / bind-cashflow / unbind-cashflow 管理扣款绑定",
          "新增预算的查询、创建、更新与进度命令，写操作默认 dry-run",
        ],
      },
    ],
  },
  {
    version: "0.1.3",
    date: "2026-06-28",
    head: "新增移动端只读预览，并让流水分类汇总可以直接反向筛选流水表。",
    groups: [
      {
        title: "移动端",
        items: ["新增 Flutter 移动端只读壳", "内置演示账本并展示首页、流水、资产和未来计划视图"],
      },
      {
        title: "流水",
        items: ["点击分类圆环色块可同步切换左侧分类筛选", "点击分类汇总列表行也会进入对应分类筛选"],
      },
    ],
  },
  {
    version: "0.1.2",
    date: "2026-06-24",
    head: "强化首页和流水页的消费柱交互，并统一流水表格与日期筛选体验。",
    groups: [
      {
        title: "桌面应用",
        items: ["首页消费柱可打开对应日期的消费流水抽屉", "首页流水表格列名和流水页保持一致"],
      },
      {
        title: "流水",
        items: [
          "流水页支持日期范围筛选和 URL 参数联动",
          "点击流水页日柱会切换当前筛选时间范围",
          "编辑流水时保留原类别并补齐无颜色分类的默认色块",
        ],
      },
    ],
  },
  {
    version: "0.1.1",
    date: "2026-06-23",
    head: "修复桌面更新检查，并打磨预算、流水和订阅详情里的关键操作。",
    groups: [
      {
        title: "桌面应用",
        items: [
          "预算详情可直接跳转到带筛选参数的流水页",
          "优化编辑流水的分类按钮、来源/日期对齐和订阅日期选择器",
        ],
      },
      {
        title: "更新",
        items: ["本地 dir 安装包缺少更新元数据时不再报错", "保留正式安装包的自动更新检查能力"],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-06-23",
    head: "FlowM 桌面端和本地优先财务模型的第一版公开发布。",
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
