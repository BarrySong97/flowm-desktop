import { FormEvent, useState } from "react"
import { Button, Input, Modal } from "@heroui/react"
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useFlowmStore } from "../../lib/stores/flowmStore"

interface CommandBarProps {
  onBeforeViewSwitch?: () => void
}

export function CommandBar({ onBeforeViewSwitch }: CommandBarProps) {
  const { t } = useTranslation()
  const input = useFlowmStore((state) => state.commandInput)
  const setInput = useFlowmStore((state) => state.setCommandInput)
  const runCommand = useFlowmStore((state) => state.runCommand)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void runCommand(input)
  }

  return (
    <form onSubmit={submit} className="flex h-[38px] shrink-0 items-center gap-2 border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-3 text-[11px]">
      <DashboardViewStrip onBeforeSwitch={onBeforeViewSwitch} />
      <div className="flex h-[26px] min-w-[220px] flex-[1.1] items-center rounded-[6px] border border-[var(--term-border)] bg-[var(--term-input)] px-2 transition-[border-color,box-shadow] duration-[120ms] focus-within:border-[var(--term-accent)] focus-within:ring-2 focus-within:ring-[var(--term-accent-soft)]">
        <span className="mr-2 shrink-0 font-mono text-[10px] text-[var(--term-ink-3)]">{t("command.prompt")}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="h-full flex-1 bg-transparent font-mono text-[11px] text-[var(--term-ink-1)] outline-none placeholder:text-[var(--term-ink-3)]"
          placeholder={t("command.placeholder")}
        />
      </div>
    </form>
  )
}

interface DashboardViewStripProps {
  onBeforeSwitch?: () => void
}

function DashboardViewStrip({ onBeforeSwitch }: DashboardViewStripProps) {
  const { t } = useTranslation()
  const dashboardViews = useFlowmStore((state) => state.dashboardViews)
  const activeDashboardViewId = useFlowmStore((state) => state.activeDashboardViewId)
  const setActiveDashboardView = useFlowmStore((state) => state.setActiveDashboardView)
  const createDashboardView = useFlowmStore((state) => state.createDashboardView)
  const updateDashboardView = useFlowmStore((state) => state.updateDashboardView)
  const removeDashboardView = useFlowmStore((state) => state.removeDashboardView)
  const saveDashboardViewOrder = useFlowmStore((state) => state.saveDashboardViewOrder)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")

  const activeIndex = dashboardViews.findIndex((view) => view.id === activeDashboardViewId)
  const activeView = activeIndex >= 0 ? dashboardViews[activeIndex] : null
  const renameView = renameId == null ? null : dashboardViews.find((view) => view.id === renameId) ?? null

  const switchView = (id: string) => {
    if (id === activeDashboardViewId) return
    onBeforeSwitch?.()
    void setActiveDashboardView(id)
  }

  const moveActive = (delta: -1 | 1) => {
    if (activeIndex < 0) return
    const nextIndex = activeIndex + delta
    if (nextIndex < 0 || nextIndex >= dashboardViews.length) return
    const ids = dashboardViews.map((view) => view.id)
    const current = ids[activeIndex]
    ids[activeIndex] = ids[nextIndex]
    ids[nextIndex] = current
    void saveDashboardViewOrder(ids)
  }

  const submitCreate = () => {
    const name = draftName.trim()
    if (name.length === 0) return
    void createDashboardView(name)
    setDraftName("")
    setCreateOpen(false)
  }

  const submitRename = () => {
    const name = draftName.trim()
    if (renameId == null || name.length === 0) return
    void updateDashboardView({ id: renameId, name })
    setRenameId(null)
    setDraftName("")
  }

  const deleteActive = () => {
    if (activeView == null) return
    if (dashboardViews.length <= 1) return
    if (
      typeof window !== "undefined" &&
      !window.confirm(t("dashboardViews.deleteConfirm", { name: activeView.name }))
    ) {
      return
    }
    onBeforeSwitch?.()
    void removeDashboardView(activeView.id)
  }

  return (
    <div className="flex h-[26px] min-w-0 flex-[1.25] items-center gap-1">
      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase text-[var(--term-ink-3)]">
        {t("dashboardViews.label")}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {dashboardViews.map((view) => {
          const active = view.id === activeDashboardViewId
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => switchView(view.id)}
              className={
                active
                  ? "h-[26px] shrink-0 px-2 text-[11px] font-semibold text-[var(--term-ink-1)] [box-shadow:inset_0_-2px_0_var(--term-accent)] transition-[color,box-shadow] duration-[120ms]"
                  : "h-[26px] shrink-0 px-2 text-[11px] text-[var(--term-ink-3)] transition-[color,box-shadow] duration-[120ms] hover:text-[var(--term-ink-1)]"
              }
            >
              {view.name}
            </button>
          )
        })}
      </div>
      <Button
        type="button"
        isIconOnly
        variant="ghost"
        className="size-[26px]"
        aria-label={t("dashboardViews.create")}
        onPress={() => {
          setDraftName("")
          setCreateOpen(true)
        }}
      >
        <Plus className="size-3" />
      </Button>
      <Button
        type="button"
        isIconOnly
        variant="ghost"
        className="size-[26px]"
        aria-label={t("dashboardViews.moveLeft")}
        isDisabled={activeIndex <= 0}
        onPress={() => moveActive(-1)}
      >
        <ArrowLeft className="size-3" />
      </Button>
      <Button
        type="button"
        isIconOnly
        variant="ghost"
        className="size-[26px]"
        aria-label={t("dashboardViews.moveRight")}
        isDisabled={activeIndex < 0 || activeIndex >= dashboardViews.length - 1}
        onPress={() => moveActive(1)}
      >
        <ArrowRight className="size-3" />
      </Button>
      <Button
        type="button"
        isIconOnly
        variant="ghost"
        className="size-[26px]"
        aria-label={t("dashboardViews.rename")}
        isDisabled={activeView == null}
        onPress={() => {
          if (activeView == null) return
          setRenameId(activeView.id)
          setDraftName(activeView.name)
        }}
      >
        <Pencil className="size-3" />
      </Button>
      <Button
        type="button"
        isIconOnly
        variant="ghost"
        className="size-[26px]"
        aria-label={t("dashboardViews.delete")}
        isDisabled={activeView == null || dashboardViews.length <= 1}
        onPress={deleteActive}
      >
        <Trash2 className="size-3" />
      </Button>

      <Modal isOpen={createOpen} onOpenChange={setCreateOpen}>
        <Modal.Backdrop />
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("dashboardViews.create")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
          <Input
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={t("dashboardViews.namePlaceholder") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitCreate()
            }}
          />
            </Modal.Body>
            <Modal.Footer>
            <Button type="button" variant="ghost" onPress={() => setCreateOpen(false)}>
              {t("dialog.cancel")}
            </Button>
            <Button type="button" onPress={submitCreate}>
              {t("dashboardViews.create")}
            </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>

      <Modal
        isOpen={renameView != null}
        onOpenChange={(open) => {
          if (!open) setRenameId(null)
        }}
      >
        <Modal.Backdrop />
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("dashboardViews.rename")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
          <Input
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={t("dashboardViews.namePlaceholder") ?? ""}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitRename()
            }}
          />
            </Modal.Body>
            <Modal.Footer>
            <Button type="button" variant="ghost" onPress={() => setRenameId(null)}>
              {t("dialog.cancel")}
            </Button>
            <Button type="button" onPress={submitRename}>
              {t("dashboardViews.rename")}
            </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  )
}
