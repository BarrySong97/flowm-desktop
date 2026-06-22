/**
 * @purpose Render and manage the settings page workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, and local UI components.
 * @gotcha  Settings changes can affect user data paths and categories; keep destructive actions explicit.
 */

import { useAtom } from "jotai"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@mock/_shim/router"
import { ScrollArea } from "../components/ui/ScrollArea"
import { CurrencySelect } from "../components/ui/CurrencySelect"
import { LedgerSection } from "./LedgerSection"
import { GroupLabel, LinkRow, Row, Toggle } from "./components"
import { trpc } from "@mock/lib/trpc"
import { usePagePerf } from "@mock/lib/debug/perf"
import { amountsHiddenAtom } from "@mock/lib/state/uiAtoms"

// The mock tRPC proxy is a read-only canned-data registry: its mutationOptions / queryFilter
// helpers aren't typed for useMutation. The refresh-rates / update-currency mutations and the
// invalidations they trigger are inert in the static mock, so route them through an `any` view
// to keep the source verbatim.
const trpcMut = trpc as any

export function SettingsPage() {
  const navigate = useNavigate()
  const [hide, setHide] = useAtom(amountsHiddenAtom)
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions())
  const currencyQuery = useQuery(trpc.reference.currencySettings.queryOptions())
  const ratesQuery = useQuery(trpc.reference.currentRates.queryOptions())
  usePagePerf("settings", [
    { name: "reference.categories", query: categoriesQuery },
    { name: "reference.currencySettings", query: currencyQuery },
    { name: "reference.currentRates", query: ratesQuery },
  ])
  const categories = categoriesQuery.data ?? []
  const displayCurrency = currencyQuery.data?.displayCurrency ?? "CNY"

  async function invalidateCurrencyViews() {
    await queryClient.invalidateQueries(trpcMut.reference.currencySettings.queryFilter())
    await queryClient.invalidateQueries(trpcMut.reference.currentRates.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.netWorth.queryFilter())
    await queryClient.invalidateQueries(trpcMut.loans.futurePressure.queryFilter())
  }
  const refreshRates: any = useMutation(
    trpcMut.reference.refreshExchangeRates.mutationOptions({
      onSuccess: () => void invalidateCurrencyViews(),
    }),
  )
  const updateCurrency: any = useMutation(
    trpcMut.reference.updateCurrencySettings.mutationOptions({
      onSuccess: async () => {
        // A new base currency needs rates for that base, then a re-convert of every total.
        await refreshRates.mutateAsync({ force: true }).catch(() => {})
        await invalidateCurrencyViews()
      },
    }),
  )
  const asOf = ratesQuery.data?.asOf
  const ratesUpdatedLabel = asOf ? new Date(asOf).toLocaleString("zh-CN") : "尚未更新"

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
              <div style={{ width: 168 }}>
                <CurrencySelect
                  value={displayCurrency}
                  onChange={(code) => updateCurrency.mutate({ displayCurrency: code })}
                  isDisabled={updateCurrency.isPending}
                />
              </div>
            </Row>
            <LinkRow
              note={`上次更新 ${ratesUpdatedLabel}`}
              onClick={() => refreshRates.mutate({ force: true })}
            >
              {refreshRates.isPending ? "刷新汇率中…" : "刷新汇率"}
            </LinkRow>
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
    </div>
  )
}
