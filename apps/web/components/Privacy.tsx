/**
 * @purpose Local-first privacy section with assurances and a storage card.
 * @role    Landing section reinforcing the no-cloud, on-device promise.
 */

import { Wrap } from "./primitives"

const POINTS = [
  {
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="10" height="7" rx="1.5" />
        <path d="M5 7V5a3 3 0 016 0v2" />
      </svg>
    ),
    title: "不要银行授权",
    desc: "导入的是你自己导出的账单文件，Flowm 从不直连你的账户。",
  },
  {
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v12M2 8h12" />
      </svg>
    ),
    title: "不上传、不联网",
    desc: "数据不离开设备。没有云账户，也就没有泄露的可能。",
  },
  {
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8l3.5 3.5L13 4" />
      </svg>
    ),
    title: "随时导出，随时带走",
    desc: "一键导出为 CSV / Excel，你的数据永远属于你。",
  },
]

const LOCK_ROWS = [
  {
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="3" y="7" width="10" height="7" rx="1.5" />
        <path d="M5 7V5a3 3 0 016 0v2" />
      </svg>
    ),
    label: "端到端，仅本机",
    v: "●",
  },
  {
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          d="M8 1.5l5.5 2.4v3.5c0 3.4-2.3 6-5.5 7-3.2-1-5.5-3.6-5.5-7V3.9z"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: "无云账户",
    v: "●",
  },
  {
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M2 8h12M10 4l4 4-4 4" />
      </svg>
    ),
    label: "可随时导出",
    v: "CSV",
  },
]

export function Privacy() {
  return (
    <section id="privacy" className="bg-surface py-[84px]">
      <Wrap className="grid items-center gap-14 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="font-lat text-[11px] font-semibold uppercase tracking-[0.16em] text-green">
            本地优先
          </div>
          <h2 className="mt-[14px] text-[clamp(26px,3.4vw,38px)] font-bold leading-[1.18] -tracking-[0.025em]">
            你的钱的全貌，
            <br />
            只存在你这台设备。
          </h2>
          <p className="mt-5 text-[15.5px] leading-[1.75] text-ink-2">
            大多数理财 app 要你交出银行授权、把账单上传到它们的服务器。Flowm
            反过来：所有账单、余额、流水都保存在本机，不联网、不上传、不分析你的数据。
          </p>
          <div className="mt-7 flex flex-col gap-4">
            {POINTS.map((p) => (
              <div key={p.title} className="flex items-start gap-[13px]">
                <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[8px] bg-green-soft text-green">
                  {p.icon}
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-ink">{p.title}</div>
                  <div className="mt-[2px] text-[12.5px] leading-[1.55] text-ink-3">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] border border-hair bg-surface p-[30px] shadow-[0_20px_40px_-22px_rgba(20,40,30,0.28)]">
          <div className="mb-[6px] text-[12px] text-ink-4">本机存储</div>
          <div className="font-mono text-[22px] font-semibold text-ink">flowm.local</div>
          {LOCK_ROWS.map((r, i) => (
            <div
              key={r.label}
              className={`flex items-center gap-[11px] py-[13px] text-[13px] text-ink-2 ${
                i === 0 ? "" : "border-t border-hair"
              }`}
            >
              <span className="flex-none text-green">{r.icon}</span>
              {r.label}
              <span className="ml-auto font-mono text-[12px] text-green">{r.v}</span>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}
