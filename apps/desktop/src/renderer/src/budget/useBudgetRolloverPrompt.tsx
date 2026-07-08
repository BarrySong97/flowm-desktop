/**
 * @purpose Prompt users to create the current monthly budget from the latest plan.
 * @role    Shared renderer hook used by overview and budget pages.
 * @deps    tRPC budget APIs, React Query invalidation, localStorage, and global confirm modal.
 * @gotcha  Never create budget periods without explicit user confirmation.
 */

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/lib/trpc"
import { todayKey } from "@/lib/dates"
import { useConfirm } from "../components/ui/ConfirmModal"
import { invalidateBudgetQueries } from "./invalidateBudgetQueries"

const DISMISSED_STORAGE_PREFIX = "flowm:budget-rollover-dismissed:"

function dismissedKey(month: string): string {
  return `${DISMISSED_STORAGE_PREFIX}${month}`
}

function readDismissed(month: string): boolean {
  try {
    return window.localStorage.getItem(dismissedKey(month)) === "1"
  } catch {
    return false
  }
}

function writeDismissed(month: string): void {
  try {
    window.localStorage.setItem(dismissedKey(month), "1")
  } catch {
    // Best effort; a failed preference write should not block budget creation.
  }
}

interface UseBudgetRolloverPromptInput {
  enabled?: boolean
  autoPrompt?: boolean
}

export function useBudgetRolloverPrompt({
  enabled = true,
  autoPrompt = true,
}: UseBudgetRolloverPromptInput = {}) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const today = todayKey()
  const month = today.slice(0, 7)
  const suggestionQuery = useQuery({
    ...trpc.budgets.rolloverSuggestion.queryOptions({ asOf: today }),
    enabled,
  })
  const createFromLatest = useMutation(trpc.budgets.createPeriodFromLatest.mutationOptions())

  function prompt(force = false) {
    const suggestion = suggestionQuery.data
    if (!suggestion) return
    if (!force && readDismissed(month)) return

    confirm({
      title: "生成本月预算？",
      description: (
        <div>
          <div>
            本月还没有预算。可以从最近一期预算（{suggestion.sourcePeriodStart} 至{" "}
            {suggestion.sourcePeriodEnd}）复制 {suggestion.itemCount} 个预算项生成本月预算。
          </div>
          <div style={{ marginTop: 8 }}>
            生成后只复制预算计划和分类范围，已用金额仍按本月已发生现金流重新计算。
          </div>
        </div>
      ),
      confirmText: "生成本月预算",
      cancelText: "暂不生成",
      loadingText: "生成中…",
      onConfirm: async () => {
        await createFromLatest.mutateAsync({ asOf: today })
        await invalidateBudgetQueries(queryClient)
      },
      onCancel: () => {
        writeDismissed(month)
      },
    })
  }

  useEffect(() => {
    if (!enabled || !autoPrompt || suggestionQuery.isPending || createFromLatest.isPending) return
    prompt(false)
  }, [
    autoPrompt,
    createFromLatest.isPending,
    enabled,
    month,
    suggestionQuery.data,
    suggestionQuery.isPending,
  ])

  return {
    suggestion: suggestionQuery.data ?? null,
    isLoading: suggestionQuery.isPending || createFromLatest.isPending,
    prompt,
  }
}
