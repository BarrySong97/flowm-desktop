import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Button, Input, Switch } from "@heroui/react"
import { Link } from "@tanstack/react-router"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Dock } from "../components/layout/Dock"

const LS_TAGS = "flowm_tags"

interface Tag { id: number; name: string }

function loadTags(): Tag[] {
  try { return JSON.parse(localStorage.getItem(LS_TAGS) ?? "[]") } catch { return [] }
}
function saveTags(tags: Tag[]) {
  localStorage.setItem(LS_TAGS, JSON.stringify(tags))
}

export function SettingsPage() {
  const currencySettings = useFlowmStore((s) => s.currencySettings)
  const exchangeRates = useFlowmStore((s) => s.exchangeRates)
  const snapshot = useFlowmStore((s) => s.snapshot)
  const loadCurrencySettings = useFlowmStore((s) => s.loadCurrencySettings)
  const updateCurrencySettings = useFlowmStore((s) => s.updateCurrencySettings)
  const refreshExchangeRates = useFlowmStore((s) => s.refreshExchangeRates)
  const error = useFlowmStore((s) => s.error)

  const [displayCurrency, setDisplayCurrency] = useState("CNY")
  const [dec, setDec] = useState("2")
  const [grp, setGrp] = useState(true)
  const [hide, setHide] = useState(false)
  const [cache, setCache] = useState("自动")
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [tags, setTags] = useState<Tag[]>(() => loadTags())
  const [newTagName, setNewTagName] = useState("")
  const [showNewTag, setShowNewTag] = useState(false)

  useEffect(() => { void loadCurrencySettings() }, [loadCurrencySettings])
  useEffect(() => { setDisplayCurrency(currencySettings?.displayCurrency ?? "CNY") }, [currencySettings?.displayCurrency])

  const normalizedCurrency = displayCurrency.trim().toUpperCase()
  const canSave = /^[A-Z]{3}$/.test(normalizedCurrency) && normalizedCurrency !== currencySettings?.displayCurrency

  async function handleSaveCurrency() {
    if (!canSave) return
    setSaving(true)
    try { await updateCurrencySettings({ displayCurrency: normalizedCurrency }) } finally { setSaving(false) }
  }

  async function handleRefreshRates() {
    setRefreshing(true)
    try { await refreshExchangeRates() } finally { setRefreshing(false) }
  }

  const catCount = useMemo(() => {
    const DEFAULT = ["居住", "餐饮", "交通", "购物", "订阅", "娱乐", "其他", "收入", "理财"]
    const extra = new Set<string>()
    for (const t of (snapshot.transactions ?? []) as Record<string, unknown>[]) {
      const c = String(t.category ?? "")
      if (c && !DEFAULT.includes(c)) extra.add(c)
    }
    return DEFAULT.length + extra.size
  }, [snapshot])

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of (snapshot.transactions ?? []) as Record<string, unknown>[]) {
      const tgs = t.tags
      if (!Array.isArray(tgs)) continue
      for (const tg of tgs) {
        const name = String(tg)
        map.set(name, (map.get(name) ?? 0) + 1)
      }
    }
    return map
  }, [snapshot])

  function addTag() {
    const name = newTagName.trim()
    if (!name || tags.some((t) => t.name === name)) return
    const next = [...tags, { id: Date.now(), name }]
    setTags(next)
    saveTags(next)
    setNewTagName("")
    setShowNewTag(false)
  }

  function removeTag(id: number) {
    const next = tags.filter((t) => t.id !== id)
    setTags(next)
    saveTags(next)
  }

  const Seg = ({ opts, val, set }: { opts: string[]; val: string; set: (v: string) => void }) => (
    <div className="st-seg">
      {opts.map((o) => <button key={o} className={o === val ? "on" : ""} onClick={() => set(o)}>{o}</button>)}
    </div>
  )

  const Row = ({ k, s, children }: { k: string; s?: string; children: ReactNode }) => (
    <div className="st-row">
      <div style={{ minWidth: 0 }}>
        <div className="k">{k}</div>
        {s && <div className="s">{s}</div>}
      </div>
      <div className="ctl">{children}</div>
    </div>
  )

  const SettingLink = ({ children, danger, note }: { children: ReactNode; danger?: boolean; note?: string }) => (
    <button className={"st-link" + (danger ? " danger" : "")}>
      {children}
      {note && <span className="dim" style={{ fontWeight: 400, fontSize: 11.5, marginLeft: "auto", whiteSpace: "nowrap" }}>{note}</span>}
      <svg className="chev" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: note ? 14 : "auto" }}>
        <path d="M6 3l5 5-5 5" />
      </svg>
    </button>
  )

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white" style={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 100 }}>
        <div className="st-wrap" style={{ padding: "30px 0 40px" }}>
          <div className="dm-num" style={{ fontSize: 26, marginBottom: 4 }}>设置</div>
          <div className="dim" style={{ fontSize: 12.5, marginBottom: 8 }}>Flowm · 个人版 · 数据全部存在本机</div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(184,65,47,0.08)", border: "1px solid var(--red)", borderRadius: 8, fontSize: 12, color: "var(--red)", marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* 显示偏好 */}
          <div className="st-grp">
            <div className="st-glabel">显示偏好</div>
            <Row k="主显示货币" s="所有资产、净资产汇总以此折算">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Input
                  variant="primary"
                  style={{ width: 80 }}
                  value={displayCurrency}
                  placeholder="CNY"
                  maxLength={3}
                  onChange={(e) => setDisplayCurrency(e.target.value.toUpperCase())}
                />
                {canSave && (
                  <Button size="sm" variant="primary" isDisabled={saving} onPress={() => void handleSaveCurrency()}>
                    {saving ? "…" : "保存"}
                  </Button>
                )}
              </div>
            </Row>
            <Row k="金额小数位" s="流水与余额的显示精度"><Seg opts={["0", "2"]} val={dec} set={setDec} /></Row>
            <Row k="千分位分隔" s="¥1,234,567 / ¥1234567">
              <Switch isSelected={grp} onChange={setGrp} size="sm" />
            </Row>
            <Row k="隐藏金额" s="演示或截图时把数字打码为 ⋯⋯">
              <Switch isSelected={hide} onChange={setHide} size="sm" />
            </Row>
          </div>

          {/* 分类与标签 */}
          <div className="st-grp">
            <div className="st-glabel">分类与标签</div>

            {/* 分类管理 → 跳转子页 */}
            <Link to="/settings-categories" style={{ textDecoration: "none" }}>
              <div className="st-link" style={{ cursor: "pointer" }}>
                <span className="k" style={{ fontSize: 14 }}>分类管理</span>
                <span className="dim" style={{ fontWeight: 400, fontSize: 11.5, marginLeft: "auto", whiteSpace: "nowrap" }}>{catCount} 个</span>
                <svg className="chev" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 14 }}>
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </div>
            </Link>

            {/* 标签 */}
            <div style={{ padding: "14px 0 4px", borderTop: "1px solid var(--hair-3)" }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span className="k" style={{ fontSize: 14 }}>标签</span>
                <span className="dim" style={{ fontSize: 11, marginLeft: "auto" }}>
                  {tags.length} 个 · 跨分类的细分场景
                </span>
              </div>
              <div className="s" style={{ marginBottom: 12 }}>
                分类回答「哪一类支出」，标签回答「咖啡/外卖/出差」这类场景，可跨分类、一笔多打。
              </div>
              <div className="st-tags">
                {tags.map((tg) => (
                  <button key={tg.id} className="st-tag" title="点击删除" onClick={() => removeTag(tg.id)}>
                    {tg.name}
                    {tagCounts.get(tg.name) != null && (
                      <span className="n">{tagCounts.get(tg.name)}</span>
                    )}
                  </button>
                ))}
                {showNewTag ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Input
                      variant="primary"
                      autoFocus
                      style={{ width: 100 }}
                      value={newTagName}
                      placeholder="标签名"
                      onKeyDown={(e) => { if (e.key === "Enter") addTag(); if (e.key === "Escape") setShowNewTag(false) }}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <Button size="sm" variant="primary" onPress={addTag}>确定</Button>
                    <Button size="sm" variant="outline" onPress={() => setShowNewTag(false)}>×</Button>
                  </span>
                ) : (
                  <button
                    className="st-tag add"
                    onClick={() => setShowNewTag(true)}
                  >
                    ＋ 新建标签
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 汇率 */}
          <div className="st-grp">
            <div className="st-glabel">汇率</div>
            <Row k="汇率来源" s="用于多币种折算">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {exchangeRates.length > 0 && (
                  <span className="dim mono" style={{ fontSize: 11 }}>
                    更新于 {new Date(exchangeRates[0].fetchedAt).toLocaleDateString("zh-CN")}
                  </span>
                )}
                <Button size="sm" variant="outline" isDisabled={refreshing} onPress={() => void handleRefreshRates()}>
                  {refreshing ? "刷新中…" : "刷新汇率"}
                </Button>
              </div>
            </Row>
          </div>

          {/* 数据与隐私 */}
          <div className="st-grp">
            <div className="st-glabel">数据与隐私</div>
            <Row k="本地缓存" s="账单解析后是否在本机留存副本"><Seg opts={["关闭", "自动"]} val={cache} set={setCache} /></Row>
            <SettingLink note="CSV · Excel">导出全部数据</SettingLink>
            <SettingLink danger>清空所有数据并重置</SettingLink>
          </div>

          {/* 关于 */}
          <div className="st-grp">
            <div className="st-glabel">关于</div>
            <Row k="版本"><span className="mono dim" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>Flowm Desktop</span></Row>
            <SettingLink>服务条款</SettingLink>
            <SettingLink>隐私政策</SettingLink>
          </div>

          <div className="dim" style={{ fontSize: 11, lineHeight: 1.6, marginTop: 26, paddingTop: 18, borderTop: "1px solid var(--hair-2)" }}>
            Flowm 不联网、不上传，所有账单与余额仅保存在这台设备。卸载或清除数据后无法恢复。
          </div>
        </div>
      </div>
      <Dock />
    </div>
  )
}
