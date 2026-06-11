import { useMemo, useState } from "react"
import { Button, Input } from "@heroui/react"
import { Link } from "@tanstack/react-router"
import { useFlowmStore } from "../lib/stores/flowmStore"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

const CAT_COLOR: Record<string, string> = {
  居住: "var(--c-live)", 餐饮: "var(--c-food)", 交通: "var(--c-trans)",
  购物: "var(--c-shop)", 订阅: "var(--c-sub)", 娱乐: "var(--c-fun)",
  其他: "var(--c-other)", 收入: "var(--c-income)", 理财: "var(--c-invest)",
}
const ALL_COLORS = [
  "var(--c-food)", "var(--c-trans)", "var(--c-shop)", "var(--c-sub)",
  "var(--c-fun)", "var(--c-live)", "var(--c-invest)", "var(--c-income)",
  "var(--c-other)", "var(--c-xfer)", "var(--amber)", "var(--red)",
  "var(--green)", "#6b7fd4", "#e8855c", "#5bac8e",
]
const DEFAULT_EXPENSE = ["居住", "餐饮", "交通", "购物", "订阅", "娱乐", "其他"]
const DEFAULT_INCOME = ["收入", "理财"]

const LS_CATS = "flowm_categories"
const LS_DISABLED = "flowm_cats_disabled"

function loadCustomCats(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_CATS) ?? "[]") } catch { return [] }
}
function saveCustomCats(cats: string[]) {
  localStorage.setItem(LS_CATS, JSON.stringify(cats))
}
function loadDisabled(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_DISABLED) ?? "[]")) } catch { return new Set() }
}
function saveDisabled(s: Set<string>) {
  localStorage.setItem(LS_DISABLED, JSON.stringify([...s]))
}

interface RenameState { cat: string; name: string; color: string }

export function CategoriesPage() {
  const snapshot = useFlowmStore((s) => s.snapshot)

  const [customCats, setCustomCats] = useState<string[]>(() => loadCustomCats())
  const [disabled, setDisabled] = useState<Set<string>>(() => loadDisabled())
  const [rename, setRename] = useState<RenameState | null>(null)
  const [catColors, setCatColors] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("flowm_cat_colors") ?? "{}") } catch { return {} }
  })
  const [newCatName, setNewCatName] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)

  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const stats = useMemo(() => {
    const countMap = new Map<string, number>()
    const monthMap = new Map<string, number>()
    for (const t of (snapshot.transactions ?? []) as Record<string, unknown>[]) {
      const cat = String(t.category ?? "其他") || "其他"
      const amt = Math.abs(Number(t.amountNumber ?? t.amount ?? 0))
      countMap.set(cat, (countMap.get(cat) ?? 0) + 1)
      if (String(t.date ?? "").startsWith(ym)) {
        monthMap.set(cat, (monthMap.get(cat) ?? 0) + amt)
      }
    }
    return { countMap, monthMap }
  }, [snapshot, ym])

  const expenseCats = [...DEFAULT_EXPENSE, ...customCats]

  function getColor(cat: string) {
    return catColors[cat] ?? CAT_COLOR[cat] ?? "var(--c-other)"
  }

  function toggleDisabled(cat: string) {
    const next = new Set(disabled)
    next.has(cat) ? next.delete(cat) : next.add(cat)
    setDisabled(next)
    saveDisabled(next)
  }

  function startRename(cat: string) {
    setRename({ cat, name: cat, color: getColor(cat) })
  }

  function applyRename() {
    if (!rename) return
    if (rename.color !== getColor(rename.cat)) {
      const next = { ...catColors, [rename.cat]: rename.color }
      setCatColors(next)
      localStorage.setItem("flowm_cat_colors", JSON.stringify(next))
    }
    setRename(null)
  }

  function addCat() {
    const name = newCatName.trim()
    if (!name || expenseCats.includes(name)) return
    const next = [...customCats, name]
    setCustomCats(next)
    saveCustomCats(next)
    setNewCatName("")
    setShowNewCat(false)
  }

  const CatRow = ({ cat, showBudget }: { cat: string; showBudget: boolean }) => {
    const count = stats.countMap.get(cat) ?? 0
    const monthAmt = stats.monthMap.get(cat) ?? 0
    const isDisabled = disabled.has(cat)
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 16, padding: "13px 0",
        borderTop: "1px solid var(--hair-3)", opacity: isDisabled ? 0.4 : 1,
      }}>
        <span className="cdot" style={{ background: getColor(cat), width: 11, height: 11, flex: "0 0 11px" }} />
        <div style={{ minWidth: 80, flex: "0 0 80px" }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{cat}</span>
        </div>
        <div className="dim" style={{ fontSize: 11.5, flex: 1 }}>
          {count > 0 ? <>{count} 笔 · 本月 ¥{fmt(monthAmt)}</> : "暂无记录"}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {showBudget && (
            <Button size="sm" variant="secondary" onPress={() => startRename(cat)}>改名/配色</Button>
          )}
          <Button size="sm" variant="tertiary" isDisabled>合并</Button>
          <Button
            size="sm"
            variant={isDisabled ? "primary" : "tertiary"}
            onPress={() => toggleDisabled(cat)}
          >
            {isDisabled ? "启用" : "停用"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white" style={{ height: "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 40 }}>
        <div className="st-wrap" style={{ padding: "24px 0 40px" }}>

          {/* Back */}
          <Link to="/settings" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-2)", marginBottom: 22, cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
              返回设置
            </div>
          </Link>

          {/* Title */}
          <div className="dm-num" style={{ fontSize: 26, marginBottom: 4 }}>分类管理</div>
          <div className="dim" style={{ fontSize: 12, marginBottom: 28 }}>
            全 App 共用一套分类 · 流水/预算/报表都引用它
          </div>

          {/* 支出分类 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", letterSpacing: ".06em" }}>支出分类</span>
              <span className="dim" style={{ fontSize: 11, marginLeft: 8 }}>{expenseCats.filter((c) => !disabled.has(c)).length} 个 · 可设预算</span>
            </div>
            {expenseCats.map((cat) => <CatRow key={cat} cat={cat} showBudget />)}

            {/* New category */}
            {showNewCat ? (
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                <Input
                  variant="primary"
                  style={{ flex: 1, maxWidth: 220 }}
                  autoFocus
                  value={newCatName}
                  placeholder="分类名称"
                  onKeyDown={(e) => { if (e.key === "Enter") addCat(); if (e.key === "Escape") setShowNewCat(false) }}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <Button variant="primary" size="sm" onPress={addCat}>确定</Button>
                <Button variant="outline" size="sm" onPress={() => setShowNewCat(false)}>取消</Button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewCat(true)}
                style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--accent)", background: "none", border: "1px dashed var(--accent-line)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}
              >
                ＋ 新建支出分类
              </button>
            )}
          </div>

          {/* 收入 / 资金流转 */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", letterSpacing: ".06em" }}>收入 / 资金流转</span>
              <span className="dim" style={{ fontSize: 11, marginLeft: 8 }}>不计入支出统计与预算</span>
            </div>
            {DEFAULT_INCOME.map((cat) => <CatRow key={cat} cat={cat} showBudget={false} />)}
          </div>

        </div>
      </div>

      {/* 改名/配色 modal */}
      {rename && (
        <div className="wf-scrim" onClick={(e) => { if (e.target === e.currentTarget) setRename(null) }}>
          <div className="wf-modal">
            <div className="wf-head">
              <div>
                <div className="wf-title">改名 / 配色</div>
                <div className="wf-sub">{rename.cat}</div>
              </div>
              <Button isIconOnly size="sm" variant="secondary" onPress={() => setRename(null)}>✕</Button>
            </div>
            <div className="wf-body">
              <div className="wf-field nb">
                <div className="wf-flabel">分类名称</div>
                <Input
                  variant="primary"
                  value={rename.name}
                  onChange={(e) => setRename((r) => r ? { ...r, name: e.target.value } : r)}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">颜色</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {ALL_COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setRename((r) => r ? { ...r, color: c } : r)}
                      style={{
                        width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer",
                        outline: rename.color === c ? "2px solid var(--ink)" : "2px solid transparent",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="wf-foot">
              <Button variant="primary" onPress={applyRename}>保存</Button>
              <Button variant="outline" onPress={() => setRename(null)}>取消</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
