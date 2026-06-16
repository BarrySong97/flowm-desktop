/**
 * @purpose Render and manage the settings page workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, and local UI components.
 * @gotcha  Settings changes can affect user data paths and categories; keep destructive actions explicit.
 */

import { useEffect, useState } from "react"
import { Button, Input, Modal, Tabs } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import type { TagSummary } from "@flowm/api"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { useConfirm } from "../components/ui/ConfirmModal"
import { ColorPickerField } from "../components/ui/ColorPickerField"
import { FormField } from "../components/ui/FormField"
import { LedgerSection } from "./LedgerSection"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"

const CHEVRON = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3l5 5-5 5" />
  </svg>
)

function GroupLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".1em",
        textTransform: "uppercase" as const,
        color: "var(--ink-4)",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

function Row({
  label,
  sub,
  first,
  children,
}: {
  label: string
  sub?: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "15px 0",
        borderTop: first ? "none" : "1px solid var(--hair-3)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3, lineHeight: 1.5 }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function LinkRow({
  children,
  note,
  danger,
  onClick,
}: {
  children: string
  note?: string
  danger?: boolean
  onClick?: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        font: "500 13px var(--sans)",
        color: danger ? (hov ? "#a23a31" : "#b4493f") : hov ? "var(--ink)" : "var(--ink-2)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "15px 0",
        borderTop: "1px solid var(--hair-3)",
        width: "100%",
        textAlign: "left",
        background: "none",
        cursor: "pointer",
        transition: "color .12s",
      }}
    >
      {children}
      {note && (
        <span
          style={{
            fontWeight: 400,
            fontSize: 11.5,
            marginLeft: "auto",
            whiteSpace: "nowrap",
            color: "var(--ink-4)",
          }}
        >
          {note}
        </span>
      )}
      <span style={{ marginLeft: note ? 0 : "auto", color: "var(--ink-4)" }}>{CHEVRON}</span>
    </button>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 23,
        borderRadius: 100,
        cursor: "pointer",
        flexShrink: 0,
        background: on ? "var(--accent)" : "var(--hair)",
        position: "relative",
        transition: "background .18s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: 2.5,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(20,40,30,.28)",
          transform: on ? "translateX(17px)" : "none",
          transition: "transform .18s",
          display: "block",
        }}
      />
    </div>
  )
}

function SegTabs({
  opts,
  val,
  onChange,
}: {
  opts: string[]
  val: string
  onChange: (v: string) => void
}) {
  return (
    <Tabs selectedKey={val} onSelectionChange={(k) => onChange(String(k))}>
      <Tabs.ListContainer>
        <Tabs.List>
          {opts.map((o) => (
            <Tabs.Tab key={o} id={o} className="h-6 px-3 text-xs">
              {o}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}

interface TagForm {
  name: string
  color: string
}

const EMPTY_TAG_FORM: TagForm = {
  name: "",
  color: "#8a9590",
}

function TagModal({
  open,
  tag,
  saving,
  onClose,
  onSave,
  onArchive,
}: {
  open: boolean
  tag: TagSummary | null
  saving: boolean
  onClose: () => void
  onSave: (form: TagForm) => void | Promise<void>
  onArchive: (tag: TagSummary) => void
}) {
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
    reset,
  } = useForm<TagForm>({ defaultValues: EMPTY_TAG_FORM })

  useEffect(() => {
    if (!open) return
    reset(tag ? { name: tag.name, color: tag.color ?? "#8a9590" } : EMPTY_TAG_FORM)
  }, [open, reset, tag])

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog style={{ maxWidth: 380 }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{tag ? "编辑标签" : "新建标签"}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
              标签用于细分流水场景，可跨分类使用。
            </p>
          </Modal.Header>
          <Modal.Body>
            <form
              id="tag-form"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit(onSave)()
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <FormField label="标签名称" required error={errors.name?.message}>
                <Input
                  variant="secondary"
                  placeholder="例如：咖啡"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name", {
                    validate: (value) => value.trim().length > 0 || "请输入标签名称",
                  })}
                />
              </FormField>
              <FormField label="颜色">
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <ColorPickerField value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </form>
          </Modal.Body>
          <Modal.Footer>
            {tag && (
              <Button
                variant="ghost"
                style={{ color: "var(--red)", marginRight: "auto" }}
                onPress={() => onArchive(tag)}
              >
                归档
              </Button>
            )}
            <Button
              variant="primary"
              isDisabled={saving || isSubmitting}
              onPress={() => void handleSubmit(onSave)()}
            >
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" onPress={onClose}>
              取消
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export function SettingsPage() {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const resetAll = useMutation(trpc.system.resetAll.mutationOptions())
  const createTag = useMutation(trpc.reference.createTag.mutationOptions())
  const updateTag = useMutation(trpc.reference.updateTag.mutationOptions())
  const archiveTag = useMutation(trpc.reference.archiveTag.mutationOptions())
  const [dec, setDec] = useState("2")
  const [grp, setGrp] = useState(true)
  const [hide, setHide] = useState(false)
  const [cache, setCache] = useState("自动")
  const [editingTag, setEditingTag] = useState<TagSummary | null>(null)
  const [showTagForm, setShowTagForm] = useState(false)
  const tagsQuery = useQuery(trpc.reference.tags.queryOptions())
  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions())
  const currencyQuery = useQuery(trpc.reference.currencySettings.queryOptions())
  usePagePerf("settings", [
    { name: "reference.tags", query: tagsQuery },
    { name: "reference.categories", query: categoriesQuery },
    { name: "reference.currencySettings", query: currencyQuery },
  ])
  const tags = tagsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const displayCurrency = currencyQuery.data?.displayCurrency ?? "—"

  async function refreshTags() {
    await queryClient.invalidateQueries(trpc.reference.tags.queryFilter())
  }

  function openTagForm(tag: TagSummary | null) {
    setEditingTag(tag)
    setShowTagForm(true)
  }

  function closeTagForm() {
    setShowTagForm(false)
    setEditingTag(null)
  }

  async function handleSaveTag(form: TagForm) {
    const input = {
      name: form.name.trim(),
      color: form.color || null,
    }
    if (editingTag) {
      await updateTag.mutateAsync({ id: editingTag.id, ...input })
    } else {
      await createTag.mutateAsync(input)
    }
    closeTagForm()
    await refreshTags()
  }

  function confirmArchiveTag(tag: TagSummary) {
    confirm({
      title: "归档标签",
      description: `归档「${tag.name}」后，新流水选择标签时不再显示它；历史流水仍保留引用。确定继续？`,
      confirmText: "归档",
      danger: true,
      onConfirm: async () => {
        await archiveTag.mutateAsync({ id: tag.id })
        closeTagForm()
        await refreshTags()
      },
    })
  }

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
            <Row label="金额小数位" sub="流水与余额的显示精度">
              <SegTabs opts={["0", "2"]} val={dec} onChange={setDec} />
            </Row>
            <Row label="千分位分隔" sub="¥1,234,567 / ¥1234567">
              <Toggle on={grp} onChange={setGrp} />
            </Row>
            <Row label="隐藏金额" sub="演示或截图时把数字打码为 ⋯⋯">
              <Toggle on={hide} onChange={setHide} />
            </Row>
          </div>

          {/* 分类与标签 */}
          <div style={{ marginTop: 30 }}>
            <GroupLabel>分类与标签</GroupLabel>
            <LinkRow note={`${categories.length} 个`}>分类管理</LinkRow>
            <div style={{ padding: "14px 0 4px", borderTop: "1px solid var(--hair-3)" }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>标签</span>
                <span style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: "auto" }}>
                  {tags.length} 个 · 跨分类的细分场景
                </span>
              </div>
              <div
                style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}
              >
                分类回答「哪一类支出」，标签回答「咖啡 / 外卖 / 出差」这类场景，可跨分类、一笔多打。
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 0" }}>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => openTagForm(tag)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      font: "500 13px var(--sans)",
                      color: "var(--ink-2)",
                      padding: "4px 10px 4px 2px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ opacity: 0.4 }}>#</span>
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--ink-4)", padding: "4px 0" }}>
                    暂无标签
                  </span>
                )}
                <button
                  onClick={() => openTagForm(null)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    font: "500 13px var(--sans)",
                    color: "var(--accent)",
                    padding: "4px 2px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ＋ 新建标签
                </button>
              </div>
            </div>
          </div>

          {/* 账本 */}
          <LedgerSection />

          {/* 数据与隐私 */}
          <div style={{ marginTop: 30 }}>
            <GroupLabel>数据与隐私</GroupLabel>
            <Row first label="本地缓存" sub="账单解析后是否在本机留存副本">
              <SegTabs opts={["关闭", "自动"]} val={cache} onChange={setCache} />
            </Row>
            <LinkRow note="CSV · Excel">导出全部数据</LinkRow>
            <LinkRow
              onClick={() =>
                confirm({
                  title: "清除本地缓存",
                  description: "清除后会重新从本地数据库加载数据，不会删除任何记录。确定继续？",
                  confirmText: "清除缓存",
                  onConfirm: async () => {
                    await queryClient.invalidateQueries()
                  },
                })
              }
            >
              清除本地缓存
            </LinkRow>
            <LinkRow
              danger
              onClick={() =>
                confirm({
                  title: "清空所有数据并重置",
                  description:
                    "这会永久删除所有流水、资产、订阅、贷款、预算、分类与标签。此操作无法恢复，确定继续？",
                  confirmText: "清空并重置",
                  danger: true,
                  onConfirm: async () => {
                    await resetAll.mutateAsync()
                    await queryClient.invalidateQueries()
                  },
                })
              }
            >
              清空所有数据并重置
            </LinkRow>
          </div>

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

      <TagModal
        open={showTagForm}
        tag={editingTag}
        saving={createTag.isPending || updateTag.isPending}
        onClose={closeTagForm}
        onSave={handleSaveTag}
        onArchive={confirmArchiveTag}
      />
      <Dock />
    </div>
  )
}
