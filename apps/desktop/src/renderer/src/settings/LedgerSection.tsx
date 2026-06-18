/**
 * @purpose Render and manage the settings ledger section workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, and local UI components.
 * @gotcha  Settings changes can affect user data paths and categories; keep destructive actions explicit.
 */

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@heroui/react"
import { useForm } from "react-hook-form"
import { useConfirm } from "../components/ui/ConfirmModal"
import { GroupLabel, RowShell } from "./components"
import { trpc } from "@/lib/trpc"
import { useLedgerSwitch } from "@/lib/switchLedger"

const INPUT_CLASS =
  "min-w-0 flex-[0_1_220px] rounded-[7px] border border-[var(--hair)] bg-white px-[9px] py-[5px] text-[13px] font-medium text-[var(--ink)] outline-none focus:border-[var(--accent)]"

/** Compact styling for ledger action buttons — smaller than HeroUI's `sm`. */
const ACTION_BTN = "h-auto min-h-0 px-2 py-[3px] text-[11.5px]"

export function LedgerSection() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const switchLedger = useLedgerSwitch()

  const listQuery = useQuery(trpc.ledgers.list.queryOptions())
  const ledgers = listQuery.data ?? []

  const switchMut = useMutation(trpc.ledgers.switch.mutationOptions())
  const createMut = useMutation(trpc.ledgers.create.mutationOptions())
  const importMut = useMutation(trpc.ledgers.importFromFile.mutationOptions())
  const renameMut = useMutation(trpc.ledgers.rename.mutationOptions())
  const removeMut = useMutation(trpc.ledgers.remove.mutationOptions())
  const setDemoMut = useMutation(trpc.ledgers.setDemo.mutationOptions())
  const revealMut = useMutation(trpc.ledgers.reveal.mutationOptions())

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const createForm = useForm({ defaultValues: { name: "" } })
  const renameForm = useForm({ defaultValues: { name: "" } })

  const refreshList = () =>
    Promise.all([
      queryClient.invalidateQueries(trpc.ledgers.list.queryFilter()),
      queryClient.invalidateQueries(trpc.ledgers.active.queryFilter()),
    ])

  async function handleSwitch(id: string) {
    await switchLedger(() => switchMut.mutateAsync({ id }))
  }

  async function handleCreate(values: { name: string }) {
    const name = values.name.trim()
    if (!name) return
    const record = await createMut.mutateAsync({ name })
    setCreating(false)
    createForm.reset({ name: "" })
    await switchLedger(() => switchMut.mutateAsync({ id: record.id }))
  }

  async function handleImport() {
    const record = await importMut.mutateAsync()
    if (record) {
      await switchLedger(() => switchMut.mutateAsync({ id: record.id }))
    } else {
      await refreshList()
    }
  }

  async function handleRename(id: string, values: { name: string }) {
    const name = values.name.trim()
    if (name) await renameMut.mutateAsync({ id, name })
    setEditingId(null)
    renameForm.reset({ name: "" })
    await refreshList()
  }

  function handleDelete(id: string, name: string) {
    confirm({
      title: `删除账本「${name}」`,
      description:
        "这会从列表移除该账本。内置账本会一并删除其数据文件，导入的外部文件不会被删除。此操作无法恢复，确定继续？",
      confirmText: "删除账本",
      danger: true,
      onConfirm: async () => {
        await removeMut.mutateAsync({ id })
        await refreshList()
      },
    })
  }

  async function handleToggleDemo(id: string, isDemo: boolean) {
    await setDemoMut.mutateAsync({ id, isDemo })
    await refreshList()
  }

  return (
    <div className="mt-[30px]">
      <GroupLabel>账本</GroupLabel>

      {ledgers.map((ledger, index) => (
        <RowShell key={ledger.id} first={index === 0} gap={12}>
          <span
            className={`h-[7px] w-[7px] shrink-0 rounded-full ${ledger.active ? "bg-[var(--accent)]" : "bg-[var(--hair)]"}`}
          />

          {editingId === ledger.id ? (
            <input
              autoFocus
              {...renameForm.register("name", {
                validate: (value) => value.trim().length > 0 || "请输入账本名称",
              })}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  void renameForm.handleSubmit((values) => handleRename(ledger.id, values))()
                if (e.key === "Escape") {
                  setEditingId(null)
                  renameForm.reset({ name: "" })
                }
              }}
              onBlur={() =>
                void renameForm.handleSubmit((values) => handleRename(ledger.id, values))()
              }
              className={INPUT_CLASS}
              aria-invalid={Boolean(renameForm.formState.errors.name)}
            />
          ) : (
            <span className="min-w-0 truncate text-[13.5px] text-[var(--ink)]">{ledger.name}</span>
          )}

          {ledger.isDemo && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--accent-soft)] px-[7px] py-[2px] text-[10.5px] font-semibold text-[var(--accent)]">
              示例
            </span>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {ledger.active ? (
              <span className="px-1 text-[11.5px] text-[var(--ink-4)]">使用中</span>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className={ACTION_BTN}
                onPress={() => handleSwitch(ledger.id)}
              >
                切换
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={ACTION_BTN}
              onPress={() => {
                setEditingId(ledger.id)
                renameForm.reset({ name: ledger.name })
              }}
            >
              重命名
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={ACTION_BTN}
              onPress={() => handleToggleDemo(ledger.id, !ledger.isDemo)}
            >
              {ledger.isDemo ? "取消示例" : "设为示例"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={ACTION_BTN}
              onPress={() => revealMut.mutate({ id: ledger.id })}
            >
              在 Finder 中显示
            </Button>
            {!ledger.active && (
              <Button
                size="sm"
                variant="ghost"
                className={ACTION_BTN}
                onPress={() => handleDelete(ledger.id, ledger.name)}
              >
                删除
              </Button>
            )}
          </div>
        </RowShell>
      ))}

      {creating ? (
        <RowShell gap={8}>
          <input
            autoFocus
            placeholder="账本名称"
            onKeyDown={(e) => {
              if (e.key === "Enter") void createForm.handleSubmit(handleCreate)()
              if (e.key === "Escape") {
                setCreating(false)
                createForm.reset({ name: "" })
              }
            }}
            className={INPUT_CLASS}
            aria-invalid={Boolean(createForm.formState.errors.name)}
            {...createForm.register("name", {
              validate: (value) => value.trim().length > 0 || "请输入账本名称",
            })}
          />
          <Button
            size="sm"
            variant="secondary"
            className={ACTION_BTN}
            style={{ borderRadius: 6 }}
            onPress={() => void createForm.handleSubmit(handleCreate)()}
          >
            创建并切换
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={ACTION_BTN}
            onPress={() => {
              setCreating(false)
              createForm.reset({ name: "" })
            }}
          >
            取消
          </Button>
        </RowShell>
      ) : (
        <RowShell gap={12}>
          <Button
            size="sm"
            variant="ghost"
            className={ACTION_BTN}
            onPress={() => setCreating(true)}
          >
            ＋ 新建账本
          </Button>
          <Button size="sm" variant="ghost" className={ACTION_BTN} onPress={handleImport}>
            导入 .sqlite3 文件
          </Button>
        </RowShell>
      )}

      <div className="mt-2.5 text-[11.5px] leading-relaxed text-[var(--ink-4)]">
        每个账本是一份独立的本地 SQLite
        文件。被标记为「示例」的账本会在顶部显示样例提示条。切换账本会重新加载全部数据。
      </div>
    </div>
  )
}
