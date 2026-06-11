import { useState } from "react"
import { Button, Label, Modal } from "@heroui/react"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

interface Sub {
  id: string; name: string; cat: "fun" | "sub" | "shop"
  cycle: "月" | "年"; amt: number; next: string
  cur: string; raw?: string; auto: boolean
}

const SUBS: Sub[] = [
  { id: "fitness", name: "威尔士健身",  cat: "fun",  cycle: "月", amt: 299, next: "06-21", cur: "CNY", auto: true },
  { id: "gpt",     name: "ChatGPT Plus", cat: "sub",  cycle: "月", amt: 145, next: "06-14", cur: "USD", raw: "$20", auto: true },
  { id: "iqiyi",   name: "爱奇艺 黄金", cat: "fun",  cycle: "月", amt: 25,  next: "06-11", cur: "CNY", auto: true },
  { id: "icloud",  name: "iCloud 200G", cat: "sub",  cycle: "月", amt: 21,  next: "06-19", cur: "CNY", auto: true },
  { id: "netease", name: "网易云 黑胶", cat: "fun",  cycle: "月", amt: 18,  next: "06-27", cur: "CNY", auto: true },
  { id: "meituan", name: "美团 会员",   cat: "sub",  cycle: "月", amt: 15,  next: "06-23", cur: "CNY", auto: true },
  { id: "sam",     name: "山姆会员",    cat: "shop", cycle: "年", amt: 260, next: "11-08", cur: "CNY", auto: false },
  { id: "jd",      name: "京东 PLUS",   cat: "shop", cycle: "年", amt: 149, next: "09-02", cur: "CNY", auto: true },
]

const CAT_COLOR: Record<Sub["cat"], string> = {
  fun: "var(--c-fun)",
  sub: "var(--c-sub)",
  shop: "var(--c-shop)",
}

const YEAR = 2026, MON = 6, TODAY = 11

const subMonthly = SUBS.reduce((s, x) => s + (x.cycle === "年" ? x.amt / 12 : x.amt), 0)
const subYearly  = SUBS.reduce((s, x) => s + (x.cycle === "年" ? x.amt : x.amt * 12), 0)

const byDay: Record<number, Sub[]> = {}
SUBS.forEach((s) => {
  const [m, d] = s.next.split("-").map(Number)
  if (m === MON) (byDay[d] = byDay[d] ?? []).push(s)
})
const monthCharges = Object.values(byDay).flat()
const monthTotal = monthCharges.reduce((s, x) => s + x.amt, 0)

const daysInMonth = new Date(YEAR, MON, 0).getDate()
const firstWd = (new Date(YEAR, MON - 1, 1).getDay() + 6) % 7
const cells: (number | null)[] = []
for (let i = 0; i < firstWd; i++) cells.push(null)
for (let d = 1; d <= daysInMonth; d++) cells.push(d)
while (cells.length % 7) cells.push(null)

type SubForm = { name: string; cycle: "月" | "年"; amt: string; next: string; auto: boolean }
const EMPTY: SubForm = { name: "", cycle: "月", amt: "", next: "2026-06-11", auto: true }

function AddSubModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<SubForm>(EMPTY)
  function patch(p: Partial<SubForm>) { setForm((f) => ({ ...f, ...p })) }
  function handleClose() { setForm(EMPTY); onClose() }

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Modal.Container>
        <Modal.Dialog style={{ maxWidth: 420 }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>添加订阅</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>周期性自动扣费</p>
          </Modal.Header>
          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>名称</Label>
                <input
                  style={{ width: "100%", font: "500 14px var(--sans)", color: "var(--ink)", padding: "10px 12px", border: "1px solid var(--hair)", borderRadius: 9, background: "var(--surface)", outline: "none", boxSizing: "border-box" }}
                  placeholder="例如：Netflix"
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>扣费金额</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--hair)", borderRadius: 11, padding: "12px 16px", background: "var(--surface-2)" }}>
                  <span style={{ fontSize: 22, fontWeight: 500, fontFamily: "var(--mono)", color: "var(--ink-3)" }}>¥</span>
                  <input
                    type="number" min="0" step="0.01"
                    style={{ flex: 1, minWidth: 0, font: "600 30px var(--mono)", color: "var(--ink)", border: "none", background: "transparent", outline: "none", letterSpacing: "-0.01em" }}
                    placeholder="0.00"
                    value={form.amt}
                    onChange={(e) => patch({ amt: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>扣费周期</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["月", "年"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => patch({ cycle: c })}
                      style={{
                        padding: "7px 20px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer",
                        border: form.cycle === c ? "1px solid var(--accent-line)" : "1px solid var(--hair)",
                        background: form.cycle === c ? "var(--accent-soft)" : "var(--surface)",
                        color: form.cycle === c ? "var(--accent)" : "var(--ink-2)",
                        transition: "all .12s",
                      }}
                    >{c}付</button>
                  ))}
                </div>
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>下次扣费日期</Label>
                <input
                  type="date"
                  style={{ width: "100%", font: "500 14px var(--sans)", color: "var(--ink)", padding: "10px 12px", border: "1px solid var(--hair)", borderRadius: 9, background: "var(--surface)", outline: "none", boxSizing: "border-box" }}
                  value={form.next}
                  onChange={(e) => patch({ next: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Label style={{ fontSize: 13, color: "var(--ink-2)" }}>自动续费</Label>
                <button
                  onClick={() => patch({ auto: !form.auto })}
                  style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: form.auto ? "var(--accent)" : "var(--hair-2)", position: "relative", transition: "background .15s" }}
                >
                  <span style={{ position: "absolute", top: 2, left: form.auto ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                </button>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" style={{ borderRadius: 5 }} isDisabled={!form.name.trim() || !form.amt} onPress={handleClose}>保存</Button>
            <Button variant="outline" style={{ borderRadius: 5 }} slot="close">取消</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export function SubscriptionsPage() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>

      {/* Fixed header */}
      <div style={{ flexShrink: 0, padding: "28px 32px 16px", borderBottom: "1px solid var(--hair-2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 40 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>每月订阅</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)", marginTop: 3 }}>
              ¥{fmt(subMonthly)}
            </div>
          </div>
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>本月扣费</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 3, letterSpacing: "-0.01em" }}>
              ¥{fmt(monthTotal)} · {monthCharges.length} 笔
            </div>
          </div>
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>订阅数 / 自动续费</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 3, letterSpacing: "-0.01em" }}>
              {SUBS.length} / {SUBS.filter((s) => s.auto).length}
            </div>
          </div>
          <div style={{ marginLeft: "auto", paddingTop: 8 }}>
            <Button size="sm" variant="primary" style={{ borderRadius: 5 }} onPress={() => setShowAdd(true)}>＋ 添加订阅</Button>
          </div>
        </div>
      </div>

      {/* Two independent scroll columns */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* Left: calendar */}
        <ScrollArea className="h-full" style={{ flex: 1 }}>
          <div style={{ padding: "20px 32px 112px" }}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{YEAR} 年 {MON} 月</span>
              <span style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 10, whiteSpace: "nowrap" }}>
                有底色的日期 = 当天有订阅扣费
              </span>
            </div>
            <div className="sub-cal">
              {["一", "二", "三", "四", "五", "六", "日"].map((w) => (
                <div className="wd" key={w}>{w}</div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div className="cell empty" key={i} />
                const chgs = byDay[d]
                const cls = "cell" + (d === TODAY ? " today" : "") + (chgs ? " has" : "")
                return (
                  <div className={cls} key={i}>
                    <span className="dn" style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, color: "var(--ink-3)" }}>
                      {d}
                      {d === TODAY && (
                        <span style={{ marginLeft: 4, fontSize: 8, fontWeight: 700 }}>今天</span>
                      )}
                    </span>
                    {chgs?.map((s, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 2, flexShrink: 0, background: CAT_COLOR[s.cat] }} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                          ¥{fmt(s.amt)}
                        </span>
                        <span style={{ fontSize: 9, color: "var(--ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.name.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Right: subscription list */}
        <ScrollArea className="h-full" style={{ width: 300, flexShrink: 0 }}>
          <div style={{ padding: "20px 24px 112px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>全部订阅</div>
            <div>
              {SUBS.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--hair-3)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 1 }}>
                      下次 {s.next} · {s.auto ? "自动续费" : "手动"}
                    </div>
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", padding: "2px 8px",
                    borderRadius: 100, fontSize: 9.5, border: "1px solid var(--hair)",
                    background: "var(--surface-2)", color: "var(--ink-3)", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {s.cycle}付
                  </span>
                  <span style={{ fontFamily: "var(--mono)", width: 52, textAlign: "right", fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em", flexShrink: 0 }}>
                    {s.raw ?? `¥${fmt(s.amt)}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px dashed var(--ink-4)", marginTop: 6, paddingTop: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>每月合计</span>
                <span style={{ fontFamily: "var(--mono)", marginLeft: "auto", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  ¥{fmt(subMonthly)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>每年合计</span>
                <span style={{ fontFamily: "var(--mono)", marginLeft: "auto", fontSize: 12, color: "var(--ink-4)" }}>
                  ¥{fmt(subYearly)}
                </span>
              </div>
              <div style={{ borderTop: "1px dashed var(--hair)", marginTop: 10, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9.5, color: "var(--ink-4)" }}>{SUBS.length} 项订阅 · 自动续费 {SUBS.filter((s) => s.auto).length}</span>
                <span style={{ fontSize: 9.5, color: "var(--ink-4)" }}>FLOWM · {YEAR}/{MON}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <Dock />
      <AddSubModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
