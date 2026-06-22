/**
 * @purpose Static mock of the desktop 设置 (settings) page.
 * @role    One of the swappable pages inside the hero app window.
 */

import type { ReactNode } from "react"

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-4)]">
        {label}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Row({
  label,
  sub,
  control,
  first,
}: {
  label: string
  sub?: string
  control: ReactNode
  first?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-[18px] py-[15px] ${first ? "" : "border-t border-[var(--hair-3)]"}`}
    >
      <div className="min-w-0">
        <div className="text-[13.5px] text-[var(--ink)]">{label}</div>
        {sub ? (
          <div className="mt-[3px] text-[11.5px] leading-normal text-[var(--ink-3)]">{sub}</div>
        ) : null}
      </div>
      <div className="ml-auto flex-none">{control}</div>
    </div>
  )
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span
      className="relative inline-block h-[23px] w-10 rounded-full"
      style={{ background: on ? "var(--accent)" : "var(--hair)" }}
    >
      <span
        className="absolute top-[2px] h-[19px] w-[19px] rounded-full bg-white shadow"
        style={{ left: on ? "18px" : "2px" }}
      />
    </span>
  )
}

const linkNote = (text: string, note: string) => (
  <div className="flex items-center border-t border-[var(--hair-3)] py-[15px] text-[13.5px] text-[var(--ink)]">
    {text}
    <span className="ml-auto text-[11.5px] text-[var(--ink-4)]">{note} →</span>
  </div>
)

export function SettingsMock() {
  return (
    <div className="flex flex-col px-[30px] pt-[26px] pb-[92px] text-left">
      <div className="border-b border-[var(--hair-2)] pb-5">
        <div className="font-['IBM_Plex_Mono'] text-[26px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
          设置
        </div>
        <div className="mt-1 text-[12.5px] text-[var(--ink-4)]">
          Flowm · 个人版 · 数据全部存在本机
        </div>
      </div>

      <div className="mx-auto mt-2 w-full max-w-[540px]">
        <Group label="显示偏好">
          <Row
            first
            label="主显示货币"
            sub="所有资产、净资产汇总以此折算"
            control={
              <span className="inline-flex items-center gap-2 rounded-[7px] border border-[var(--hair)] bg-white px-[10px] py-[6px] text-[12.5px] text-[var(--ink)]">
                CNY · 人民币 ▾
              </span>
            }
          />
          {linkNote("刷新汇率", "上次更新 06-21")}
          <Row label="隐藏金额" sub="演示或截图时把数字打码为 ⋯⋯" control={<Toggle />} />
        </Group>

        <Group label="分类">{linkNote("分类管理", "12 个")}</Group>

        <Group label="账本">
          <Row
            first
            label="个人账本"
            sub="使用中 · flowm.local"
            control={<span className="text-[11.5px] text-[var(--ink-4)]">使用中</span>}
          />
          <div className="flex items-center gap-3 border-t border-[var(--hair-3)] py-[15px] text-[13px]">
            <span className="rounded-[7px] border border-[var(--hair)] px-[11px] py-[6px] text-[var(--ink-2)]">
              ＋ 新建账本
            </span>
            <span className="rounded-[7px] border border-[var(--hair)] px-[11px] py-[6px] text-[var(--ink-2)]">
              导入 .sqlite3 文件
            </span>
          </div>
          <div className="mt-2.5 text-[11.5px] leading-relaxed text-[var(--ink-4)]">
            每个账本是一份独立的本地 SQLite 文件，可随时备份、迁移、带走。
          </div>
        </Group>

        <Group label="关于">
          <Row
            first
            label="版本"
            control={
              <span className="font-['IBM_Plex_Mono'] text-[12.5px] text-[var(--ink-4)]">
                v1.4.0 · 2026.06
              </span>
            }
          />
          {linkNote("服务条款", "")}
          {linkNote("隐私政策", "")}
          {linkNote("开源许可", "")}
        </Group>

        <div className="mt-7 border-t border-[var(--hair-2)] pt-4 text-[11px] leading-[1.6] text-[var(--ink-4)]">
          Flowm 不联网、不上传，所有数据只保存在你的设备上。
        </div>
      </div>
    </div>
  )
}
