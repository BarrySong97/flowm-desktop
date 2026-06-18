/**
 * @purpose Render and manage the settings page workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, and local UI components.
 * @gotcha  Settings changes can affect user data paths and categories; keep destructive actions explicit.
 */

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { LedgerSection } from "./LedgerSection"
import { GroupLabel, LinkRow, Row, Toggle } from "./components"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"

export function SettingsPage() {
  const navigate = useNavigate()
  const [grp, setGrp] = useState(true)
  const [hide, setHide] = useState(false)
  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions())
  const currencyQuery = useQuery(trpc.reference.currencySettings.queryOptions())
  usePagePerf("settings", [
    { name: "reference.categories", query: categoriesQuery },
    { name: "reference.currencySettings", query: currencyQuery },
  ])
  const categories = categoriesQuery.data ?? []
  const displayCurrency = currencyQuery.data?.displayCurrency ?? "—"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Fixed header */}
      <div
        style={{
          flexShrink: 0,
          padding: "28px 32px 20px",
          borderBottom: "1px solid var(--hair-2)",
        }}
      >
        <div style={{ width: 540, maxWidth: 540, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              marginBottom: 4,
            }}
          >
            设置
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-4)" }}>
            Flowm · 个人版 · 数据全部存在本机
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
        <div style={{ width: 540, maxWidth: 540, margin: "0 auto", padding: "0 0 60px" }}>
          {/* 显示偏好 */}
          <div style={{ marginTop: 30 }}>
            <GroupLabel>显示偏好</GroupLabel>
            <Row first label="主显示货币" sub="所有资产、净资产汇总以此折算">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-line)",
                  color: "var(--accent)",
                  whiteSpace: "nowrap",
                }}
              >
                {displayCurrency}
              </span>
            </Row>
            <Row label="千分位分隔" sub="¥1,234,567 / ¥1234567">
              <Toggle on={grp} onChange={setGrp} />
            </Row>
            <Row label="隐藏金额" sub="演示或截图时把数字打码为 ⋯⋯">
              <Toggle on={hide} onChange={setHide} />
            </Row>
          </div>

          {/* 分类 */}
          <div style={{ marginTop: 30 }}>
            <GroupLabel>分类</GroupLabel>
            <LinkRow
              note={`${categories.length} 个`}
              onClick={() => void navigate({ to: "/settings-categories" })}
            >
              分类管理
            </LinkRow>
          </div>

          {/* 账本 */}
          <LedgerSection />

          {/* 关于 */}
          <div style={{ marginTop: 30 }}>
            <GroupLabel>关于</GroupLabel>
            <Row first label="版本">
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12.5,
                  color: "var(--ink-4)",
                  whiteSpace: "nowrap",
                }}
              >
                v1.4.0 · 2026.06
              </span>
            </Row>
            <LinkRow>服务条款</LinkRow>
            <LinkRow>隐私政策</LinkRow>
            <LinkRow>开源许可</LinkRow>
          </div>

          {/* Footer */}
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-4)",
              lineHeight: 1.6,
              marginTop: 26,
              paddingTop: 18,
              borderTop: "1px solid var(--hair-2)",
            }}
          >
            Flowm 不联网、不上传，所有账单与余额仅保存在这台设备。卸载或清除数据后无法恢复。
          </div>
        </div>
      </ScrollArea>

      <Dock />
    </div>
  )
}
