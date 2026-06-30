/**
 * @purpose Show cashflow events bound to a subscription/loan and let the user add/remove bindings.
 * @role    Renderer right-side drawer for the deduction-binding feature, shared by both detail pages.
 * @deps    React, tRPC cashflow.linkedTo/unbind, HeroUI Drawer/Button, and CashflowPickerModal.
 * @gotcha  Display-only — bound flows never alter subscription/loan forecast aggregates (red line).
 */

import { useMemo, useState } from "react"
import { Button, Drawer, Spinner } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { currencySymbol } from "@flowm/shared"
import { notify } from "@flowm/ui"
import type { CashflowLinkOwnerType } from "@flowm/api"
import { trpc } from "@/lib/trpc"
import { useMoney } from "@/lib/useMoney"
import { CashflowPickerModal } from "./CashflowPickerModal"

interface Props {
  open: boolean
  ownerType: CashflowLinkOwnerType
  ownerId: string
  ownerLabel: string
  onClose: () => void
}

export function LinkedCashflowDrawer({ open, ownerType, ownerId, ownerLabel, onClose }: Props) {
  const fmt = useMoney()
  const queryClient = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)

  const linkedQuery = useQuery({
    ...trpc.cashflow.linkedTo.queryOptions({ ownerType, ownerId }),
    enabled: open,
  })
  const linked = useMemo(() => linkedQuery.data ?? [], [linkedQuery.data])
  const alreadyLinkedIds = useMemo(
    () => new Set(linked.map((item) => String(item.event.id))),
    [linked],
  )

  const unbind = useMutation(
    trpc.cashflow.unbind.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.cashflow.linkedTo.queryFilter())
        notify.success("已解绑")
      },
      onError: (error) => {
        notify.error(`解绑失败：${error instanceof Error ? error.message : String(error)}`)
      },
    }),
  )

  return (
    <>
      <Drawer.Backdrop
        isOpen={open}
        onOpenChange={(v) => {
          if (!v) onClose()
        }}
      >
        <Drawer.Content placement="right">
          <Drawer.Dialog style={{ width: 576, maxWidth: "85vw", touchAction: "none" }}>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading style={{ fontSize: 14 }}>扣款流水</Drawer.Heading>
              <div style={{ fontSize: 11, marginTop: 2, color: "var(--ink-4)" }}>
                「{ownerLabel}」已绑定 {linked.length}{" "}
                笔流水。绑定仅用于追溯实际扣款，不影响计划与统计。
              </div>
            </Drawer.Header>
            <Drawer.Body>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <Button
                  size="sm"
                  variant="primary"
                  style={{ borderRadius: 5 }}
                  onPress={() => setPickerOpen(true)}
                >
                  手动添加
                </Button>
              </div>

              {linkedQuery.isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                  <Spinner />
                </div>
              ) : linked.length === 0 ? (
                <div style={{ padding: "16px 0", fontSize: 12, color: "var(--ink-4)" }}>
                  暂无绑定流水，点击「手动添加」从流水列表中选择。
                </div>
              ) : (
                <div>
                  {linked.map(({ linkId, event }) => {
                    const isOut = event.direction === "out"
                    return (
                      <div
                        key={linkId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 4px",
                          borderBottom: "1px solid var(--hair-3)",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                            {event.title || event.counterparty || "未命名流水"}
                          </div>
                          <div style={{ fontSize: 10.5, marginTop: 2, color: "var(--ink-4)" }}>
                            {event.date} · {event.categoryName ?? "未分类"} ·{" "}
                            {event.source ?? "未知"}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: 12,
                            color: isOut ? "var(--red)" : "var(--accent)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isOut ? "−" : "+"}
                          {currencySymbol(event.currency)}
                          {fmt(Math.abs(Number(event.amount || 0)), 2)}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={unbind.isPending}
                          style={{ borderRadius: 5, flexShrink: 0, color: "var(--red)" }}
                          onPress={() => unbind.mutate({ linkId })}
                        >
                          {unbind.isPending && unbind.variables?.linkId === linkId
                            ? "解绑中…"
                            : "解绑"}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <CashflowPickerModal
        open={pickerOpen}
        ownerType={ownerType}
        ownerId={ownerId}
        alreadyLinkedIds={alreadyLinkedIds}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}
