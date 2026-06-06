import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Button, Card, Drawer, Input, Label, ListBox, ListBoxItem, Select, Table, TextArea, TextField } from "@heroui/react"
import { useTranslation } from "react-i18next"
import {
  ScrollArea,
} from "@flowm/ui"
import type { PlanSummary } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"

type BillingCycle = "weekly" | "monthly" | "yearly"

interface SubscriptionFormState {
  id: number | null
  name: string
  merchant: string
  amount: string
  currency: string
  billingCycle: BillingCycle
  nextDueDate: string
  categoryLabel: string
  note: string
  status: string
}

const EMPTY_FORM: SubscriptionFormState = {
  id: null,
  name: "",
  merchant: "",
  amount: "",
  currency: "CNY",
  billingCycle: "monthly",
  nextDueDate: new Date().toISOString().slice(0, 10),
  categoryLabel: "订阅",
  note: "",
  status: "active",
}

function scheduleRule(cycle: BillingCycle, nextDueDate: string) {
  const day = Math.max(1, Math.min(31, Number(nextDueDate.slice(8, 10)) || 1))
  if (cycle === "weekly") return "FREQ=WEEKLY"
  if (cycle === "yearly") return `FREQ=YEARLY;BYMONTHDAY=${day}`
  return `FREQ=MONTHLY;BYMONTHDAY=${day}`
}

function monthlyEquivalent(plan: PlanSummary) {
  const amount = Number(plan.amount) || 0
  const rule = plan.scheduleRule.toUpperCase()
  if (rule.includes("FREQ=WEEKLY")) return amount * 52 / 12
  if (rule.includes("FREQ=YEARLY")) return amount / 12
  return amount
}

function money(value: number, currency = "CNY") {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function metaString(plan: PlanSummary, key: string) {
  const value = plan.meta?.[key]
  return typeof value === "string" ? value : ""
}

export function SubscriptionsPage() {
  const { t } = useTranslation()
  const plans = useFlowmStore((state) => state.plans)
  const loadPlans = useFlowmStore((state) => state.loadPlans)
  const createPlan = useFlowmStore((state) => state.createPlan)
  const updatePlan = useFlowmStore((state) => state.updatePlan)
  const error = useFlowmStore((state) => state.error)
  const [form, setForm] = useState<SubscriptionFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  const subscriptions = useMemo(
    () => plans.filter((plan) => plan.planType === "subscription"),
    [plans],
  )
  const selectedPlan = subscriptions.find((plan) => plan.id === selectedPlanId) ?? null
  const activeSubscriptions = subscriptions.filter((plan) => plan.status === "active")
  const monthlyCost = activeSubscriptions.reduce((sum, plan) => sum + monthlyEquivalent(plan), 0)
  const pausedCount = subscriptions.filter((plan) => plan.status === "paused").length

  const updateForm = <K extends keyof SubscriptionFormState>(key: K, value: SubscriptionFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const editPlan = (plan: PlanSummary) => {
    const cycle = metaString(plan, "billingCycle") as BillingCycle
    setForm({
      id: plan.id,
      name: plan.name,
      merchant: plan.counterparty ?? metaString(plan, "merchant"),
      amount: plan.amount,
      currency: plan.currency,
      billingCycle: cycle === "weekly" || cycle === "yearly" ? cycle : "monthly",
      nextDueDate: plan.nextDueDate ?? plan.startDate,
      categoryLabel: metaString(plan, "categoryLabel") || "订阅",
      note: metaString(plan, "note"),
      status: plan.status,
    })
  }

  const editSelectedPlan = (plan: PlanSummary) => {
    editPlan(plan)
    setSelectedPlanId(null)
  }

  const togglePlanStatus = async (plan: PlanSummary) => {
    await updatePlan({ id: plan.id, status: plan.status === "active" ? "paused" : "active" })
  }

  const submit = async () => {
    if (form.name.trim().length === 0) return
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount < 0) return
    setSubmitting(true)
    try {
      const input = {
        name: form.name.trim(),
        counterparty: form.merchant.trim() || null,
        amount: amount.toFixed(2),
        currency: form.currency || "CNY",
        scheduleRule: scheduleRule(form.billingCycle, form.nextDueDate),
        startDate: form.nextDueDate,
        status: form.status,
        flowKind: "consumption_expense",
        meta: {
          billingCycle: form.billingCycle,
          merchant: form.merchant.trim() || undefined,
          categoryLabel: form.categoryLabel.trim() || undefined,
          note: form.note.trim() || undefined,
        },
      }
      if (form.id == null) {
        await createPlan({ ...input, planType: "subscription" })
      } else {
        await updatePlan({ id: form.id, ...input })
      }
      setForm(EMPTY_FORM)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col gap-1 border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-3">
        <h1 className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--term-ink-1)]">
          {t("subscriptions.title")}
        </h1>
        <p className="text-[11px] text-[var(--term-ink-3)]">{t("subscriptions.planDescription")}</p>
      </header>
      <ScrollArea className="min-h-0 flex-1" contentClassName="flex flex-col gap-4 p-4 pb-[var(--flowm-bottom-nav-safe)]">
        <section className="grid gap-2 sm:grid-cols-3">
          <Metric label={t("subscriptions.summary.monthly")} value={money(monthlyCost)} />
          <Metric label={t("subscriptions.summary.active")} value={String(activeSubscriptions.length)} />
          <Metric label={t("subscriptions.summary.paused")} value={String(pausedCount)} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[8px] p-0 shadow-none overflow-hidden border border-[var(--term-border)]">
            <SectionHeader title={t("subscriptions.listTitle")} description={t("subscriptions.listDescription")} />
            {subscriptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-[12px] text-[var(--term-ink-3)]">{t("subscriptions.empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Content>
                  <Table.Header>
                      <Table.Column>{t("subscriptions.table.name")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.merchant")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.frequency")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.amount")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.monthly")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.nextDue")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.status")}</Table.Column>
                      <Table.Column>{t("subscriptions.table.actions")}</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {subscriptions.map((plan) => (
                      <Table.Row
                        key={plan.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        <Table.Cell className="font-medium text-[var(--term-ink-1)]">{plan.name}</Table.Cell>
                        <Table.Cell>{plan.counterparty ?? metaString(plan, "merchant")}</Table.Cell>
                        <Table.Cell>{t(`subscriptions.frequency.${metaString(plan, "billingCycle") || "monthly"}`)}</Table.Cell>
                        <Table.Cell>{money(Number(plan.amount), plan.currency)}</Table.Cell>
                        <Table.Cell>{money(monthlyEquivalent(plan), plan.currency)}</Table.Cell>
                        <Table.Cell>{plan.nextDueDate ?? plan.startDate}</Table.Cell>
                        <Table.Cell>{t(`subscriptions.status.${plan.status}`)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(event) => event.stopPropagation()}
                              onPress={() => {
                                editPlan(plan)
                              }}
                            >
                              {t("subscriptions.actions.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(event) => event.stopPropagation()}
                              onPress={() => {
                                void togglePlanStatus(plan)
                              }}
                            >
                              {plan.status === "active" ? t("subscriptions.actions.pause") : t("subscriptions.actions.resume")}
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
                </Table>
              </div>
            )}
          </Card>

          <Card className="rounded-[8px] p-0 shadow-none overflow-hidden border border-[var(--term-border)]">
            <SectionHeader title={form.id == null ? t("subscriptions.form.create") : t("subscriptions.form.edit")} description={t("subscriptions.form.description")} />
            <div className="grid gap-3 p-3">
              <FieldRow label={t("subscriptions.form.name")}><TextField><Input value={form.name} onChange={(event) => updateForm("name", event.target.value)} /></TextField></FieldRow>
              <FieldRow label={t("subscriptions.form.merchant")}><TextField><Input value={form.merchant} onChange={(event) => updateForm("merchant", event.target.value)} /></TextField></FieldRow>
              <div className="grid gap-3 sm:grid-cols-3">
                <FieldRow label={t("subscriptions.form.amount")}><TextField><Input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("subscriptions.form.currency")}><TextField><Input value={form.currency} onChange={(event) => updateForm("currency", event.target.value.toUpperCase())} /></TextField></FieldRow>
                <SelectField
                  label={t("subscriptions.form.billingCycle")}
                  value={form.billingCycle}
                  options={[
                    { value: "weekly", label: t("subscriptions.frequency.weekly") },
                    { value: "monthly", label: t("subscriptions.frequency.monthly") },
                    { value: "yearly", label: t("subscriptions.frequency.yearly") },
                  ]}
                  onChange={(value) => updateForm("billingCycle", value as BillingCycle)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label={t("subscriptions.form.nextDueDate")}><TextField><Input type="date" value={form.nextDueDate} onChange={(event) => updateForm("nextDueDate", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("subscriptions.form.categoryLabel")}><TextField><Input value={form.categoryLabel} onChange={(event) => updateForm("categoryLabel", event.target.value)} /></TextField></FieldRow>
              </div>
              <SelectField
                label={t("subscriptions.form.status")}
                value={form.status}
                options={[
                  { value: "active", label: t("subscriptions.status.active") },
                  { value: "paused", label: t("subscriptions.status.paused") },
                  { value: "canceled", label: t("subscriptions.status.canceled") },
                ]}
                onChange={(value) => updateForm("status", value)}
              />
              <FieldRow label={t("subscriptions.form.note")}><TextField><TextArea value={form.note} onChange={(event) => updateForm("note", event.target.value)} /></TextField></FieldRow>
              {error ? <div className="text-[11px] text-[var(--term-red)]">{error}</div> : null}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onPress={() => setForm(EMPTY_FORM)}>{t("subscriptions.actions.reset")}</Button>
                <Button onPress={() => void submit()} isDisabled={submitting}>{t("subscriptions.actions.save")}</Button>
              </div>
            </div>
          </Card>
        </section>
      </ScrollArea>
      <SubscriptionDetailSheet
        plan={selectedPlan}
        onOpenChange={(open) => {
          if (!open) setSelectedPlanId(null)
        }}
        onEdit={editSelectedPlan}
        onToggleStatus={togglePlanStatus}
        onCancel={(plan) => updatePlan({ id: plan.id, status: "canceled" })}
      />
    </main>
  )
}

function SubscriptionDetailSheet({
  plan,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onCancel,
}: {
  plan: PlanSummary | null
  onOpenChange: (open: boolean) => void
  onEdit: (plan: PlanSummary) => void
  onToggleStatus: (plan: PlanSummary) => Promise<void>
  onCancel: (plan: PlanSummary) => Promise<PlanSummary | void>
}) {
  const { t } = useTranslation()
  const billingCycle = plan ? metaString(plan, "billingCycle") || "monthly" : "monthly"
  const merchant = plan ? plan.counterparty ?? metaString(plan, "merchant") : ""
  const category = plan ? metaString(plan, "categoryLabel") : ""
  const note = plan ? metaString(plan, "note") : ""

  return (
    <Drawer isOpen={plan != null} onOpenChange={onOpenChange}>
      <Drawer.Backdrop />
      <Drawer.Content placement="right" className="w-full sm:!max-w-[1280px]">
        <Drawer.Dialog>
        {plan ? (
          <>
            <Drawer.Header className="border-b border-[var(--term-border)]">
              <Drawer.Heading>{plan.name}</Drawer.Heading>
              <p className="text-[12px] text-[var(--term-ink-3)]">
                {merchant || t("subscriptions.title")} · {t(`subscriptions.status.${plan.status}`)}
              </p>
            </Drawer.Header>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,360px)_1fr] divide-x divide-[var(--term-border)]">
              <aside className="flex min-h-0 flex-col gap-4 overflow-auto px-4 pb-4 pt-3">
                <Section title={t("subscriptions.detail.terms")}>
                  <KV label={t("subscriptions.detail.amount")} value={money(Number(plan.amount), plan.currency)} />
                  <KV label={t("subscriptions.detail.frequency")} value={t(`subscriptions.frequency.${billingCycle}`)} />
                  <KV label={t("subscriptions.detail.monthlyEquivalent")} value={money(monthlyEquivalent(plan), plan.currency)} />
                  <KV label={t("subscriptions.detail.yearlyEquivalent")} value={money(monthlyEquivalent(plan) * 12, plan.currency)} />
                  <KV label={t("subscriptions.detail.startDate")} value={plan.startDate} />
                  <KV label={t("subscriptions.detail.nextDueDate")} value={plan.nextDueDate ?? plan.startDate} />
                  <KV label={t("subscriptions.detail.status")} value={t(`subscriptions.status.${plan.status}`)} />
                </Section>
                <Section title={t("subscriptions.detail.accounts")}>
                  <KV label={t("subscriptions.detail.merchant")} value={merchant || "—"} />
                  <KV label={t("subscriptions.detail.category")} value={category || "—"} />
                  <KV label={t("subscriptions.detail.note")} value={note || "—"} />
                </Section>
                <Section title={t("subscriptions.detail.actions")}>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onPress={() => onEdit(plan)}>{t("subscriptions.actions.edit")}</Button>
                    <Button variant="outline" size="sm" onPress={() => void onToggleStatus(plan)}>
                      {plan.status === "active" ? t("subscriptions.actions.pause") : t("subscriptions.actions.resume")}
                    </Button>
                    {plan.status !== "canceled" ? (
                      <Button variant="ghost" size="sm" onPress={() => void onCancel(plan)}>{t("subscriptions.detail.cancel")}</Button>
                    ) : null}
                  </div>
                </Section>
              </aside>
              <section className="flex min-h-0 flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-2">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">
                    {t("subscriptions.detail.history")}
                  </h2>
                  <span className="font-mono text-[11px] text-[var(--term-ink-3)]">0</span>
                </div>
                <div className="px-4 py-4 text-[11px] text-[var(--term-ink-3)]">{t("subscriptions.detail.noHistory")}</div>
              </section>
            </div>
          </>
        ) : null}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{title}</h2>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--term-border)] py-1.5 text-[12px] last:border-0">
      <span className="text-[var(--term-ink-3)]">{label}</span>
      <span className="max-w-[180px] truncate text-right font-mono text-[var(--term-ink-1)]">{value}</span>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[8px] p-0 shadow-none border border-[var(--term-border)]">
      <Card.Content className="px-3 py-2 gap-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{label}</div>
        <div className="mt-1 truncate text-[16px] font-semibold text-[var(--term-ink-1)]">{value}</div>
      </Card.Content>
    </Card>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-[var(--term-border)] bg-[var(--term-panel-alt)] px-3 py-2">
      <h2 className="text-[12px] font-semibold text-[var(--term-ink-1)]">{title}</h2>
      <p className="mt-0.5 text-[11px] text-[var(--term-ink-3)]">{description}</p>
    </header>
  )
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{label}</Label>
      {children}
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{label}</Label>
      <Select
        selectedKey={value}
        onSelectionChange={(key) => {
          if (key != null) onChange(String(key))
        }}
      >
        <Select.Trigger>
          <Select.Value>{options.find((option) => option.value === value)?.label ?? value}</Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((option) => (
              <ListBoxItem key={option.value} id={option.value}>
                {option.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  )
}
