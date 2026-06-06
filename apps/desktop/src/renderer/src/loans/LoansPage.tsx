import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Button, Card, Drawer, Input, Label, ListBox, ListBoxItem, Select, Table, TextArea, TextField } from "@heroui/react"
import { useTranslation } from "react-i18next"
import {
  ScrollArea,
} from "@flowm/ui"
import type { PlanSummary } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"

interface LoanFormState {
  id: number | null
  name: string
  institution: string
  principalRemaining: string
  monthlyPayment: string
  annualRate: string
  paymentDay: string
  startDate: string
  endDate: string
  note: string
  status: string
}

const EMPTY_FORM: LoanFormState = {
  id: null,
  name: "",
  institution: "",
  principalRemaining: "",
  monthlyPayment: "",
  annualRate: "",
  paymentDay: "20",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  note: "",
  status: "active",
}

function money(value: number, currency = "CNY") {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function metaString(plan: PlanSummary, key: string) {
  const value = plan.meta?.[key]
  return typeof value === "string" ? value : ""
}

function nextPaymentRule(paymentDay: string) {
  const day = Math.max(1, Math.min(31, Number(paymentDay) || 1))
  return `FREQ=MONTHLY;BYMONTHDAY=${day}`
}

export function LoansPage() {
  const { t } = useTranslation()
  const plans = useFlowmStore((state) => state.plans)
  const loadPlans = useFlowmStore((state) => state.loadPlans)
  const createPlan = useFlowmStore((state) => state.createPlan)
  const updatePlan = useFlowmStore((state) => state.updatePlan)
  const error = useFlowmStore((state) => state.error)
  const [form, setForm] = useState<LoanFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  const loans = useMemo(() => plans.filter((plan) => plan.planType === "loan_repayment"), [plans])
  const selectedPlan = loans.find((plan) => plan.id === selectedPlanId) ?? null
  const activeLoans = loans.filter((plan) => plan.status === "active")
  const monthlyPayment = activeLoans.reduce((sum, plan) => sum + Number(plan.amount || 0), 0)
  const principalRemaining = activeLoans.reduce((sum, plan) => sum + Number(metaString(plan, "principalRemaining") || 0), 0)
  const nextDue = activeLoans
    .map((plan) => plan.nextDueDate ?? plan.startDate)
    .filter(Boolean)
    .sort()[0] ?? "—"

  const updateForm = <K extends keyof LoanFormState>(key: K, value: LoanFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const editPlan = (plan: PlanSummary) => {
    setForm({
      id: plan.id,
      name: plan.name,
      institution: plan.counterparty ?? metaString(plan, "institution"),
      principalRemaining: metaString(plan, "principalRemaining"),
      monthlyPayment: plan.amount,
      annualRate: metaString(plan, "annualRate"),
      paymentDay: metaString(plan, "paymentDay") || "20",
      startDate: plan.nextDueDate ?? plan.startDate,
      endDate: plan.endDate ?? "",
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
    const amount = Number(form.monthlyPayment)
    const principal = Number(form.principalRemaining)
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(principal) || principal < 0) return
    setSubmitting(true)
    try {
      const input = {
        name: form.name.trim(),
        counterparty: form.institution.trim() || null,
        amount: amount.toFixed(2),
        currency: "CNY",
        scheduleRule: nextPaymentRule(form.paymentDay),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        status: form.status,
        flowKind: "debt_repayment",
        meta: {
          institution: form.institution.trim() || undefined,
          principalRemaining: principal.toFixed(2),
          annualRate: form.annualRate.trim() || undefined,
          paymentDay: form.paymentDay.trim() || undefined,
          note: form.note.trim() || undefined,
        },
      }
      if (form.id == null) {
        await createPlan({ ...input, planType: "loan_repayment" })
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
          {t("loans.title")}
        </h1>
        <p className="text-[11px] text-[var(--term-ink-3)]">{t("loans.planDescription")}</p>
      </header>
      <ScrollArea className="min-h-0 flex-1" contentClassName="flex flex-col gap-4 p-4 pb-[var(--flowm-bottom-nav-safe)]">
        <section className="grid gap-2 sm:grid-cols-4">
          <Metric label={t("loans.summary.remaining")} value={money(principalRemaining)} />
          <Metric label={t("loans.summary.monthly")} value={money(monthlyPayment)} />
          <Metric label={t("loans.summary.active")} value={String(activeLoans.length)} />
          <Metric label={t("loans.summary.nextDue")} value={nextDue} />
        </section>

        <div className="border border-[var(--term-border)] bg-[var(--term-panel-alt)] px-3 py-2 text-[11px] text-[var(--term-ink-3)]">
          {t("loans.assetHint")}
        </div>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[8px] p-0 shadow-none overflow-hidden border border-[var(--term-border)]">
            <SectionHeader title={t("loans.listTitle")} description={t("loans.listDescription")} />
            {loans.length === 0 ? (
              <div className="px-3 py-8 text-center text-[12px] text-[var(--term-ink-3)]">{t("loans.empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Content>
                  <Table.Header>
                      <Table.Column>{t("loans.table.name")}</Table.Column>
                      <Table.Column>{t("loans.table.institution")}</Table.Column>
                      <Table.Column>{t("loans.table.remaining")}</Table.Column>
                      <Table.Column>{t("loans.table.monthly")}</Table.Column>
                      <Table.Column>{t("loans.table.rate")}</Table.Column>
                      <Table.Column>{t("loans.table.nextDue")}</Table.Column>
                      <Table.Column>{t("loans.table.status")}</Table.Column>
                      <Table.Column>{t("loans.table.actions")}</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {loans.map((plan) => (
                      <Table.Row
                        key={plan.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        <Table.Cell className="font-medium text-[var(--term-ink-1)]">{plan.name}</Table.Cell>
                        <Table.Cell>{plan.counterparty ?? metaString(plan, "institution")}</Table.Cell>
                        <Table.Cell>{money(Number(metaString(plan, "principalRemaining") || 0), plan.currency)}</Table.Cell>
                        <Table.Cell>{money(Number(plan.amount), plan.currency)}</Table.Cell>
                        <Table.Cell>{metaString(plan, "annualRate") || "—"}</Table.Cell>
                        <Table.Cell>{plan.nextDueDate ?? plan.startDate}</Table.Cell>
                        <Table.Cell>{t(`loans.status.${plan.status}`)}</Table.Cell>
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
                              {t("loans.actions.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(event) => event.stopPropagation()}
                              onPress={() => {
                                void togglePlanStatus(plan)
                              }}
                            >
                              {plan.status === "active" ? t("loans.actions.pause") : t("loans.actions.resume")}
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
            <SectionHeader title={form.id == null ? t("loans.form.create") : t("loans.form.edit")} description={t("loans.form.description")} />
            <div className="grid gap-3 p-3">
              <FieldRow label={t("loans.form.name")}><TextField><Input value={form.name} onChange={(event) => updateForm("name", event.target.value)} /></TextField></FieldRow>
              <FieldRow label={t("loans.form.institution")}><TextField><Input value={form.institution} onChange={(event) => updateForm("institution", event.target.value)} /></TextField></FieldRow>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label={t("loans.form.principalRemaining")}><TextField><Input type="number" min="0" step="0.01" value={form.principalRemaining} onChange={(event) => updateForm("principalRemaining", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("loans.form.monthlyPayment")}><TextField><Input type="number" min="0" step="0.01" value={form.monthlyPayment} onChange={(event) => updateForm("monthlyPayment", event.target.value)} /></TextField></FieldRow>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FieldRow label={t("loans.form.annualRate")}><TextField><Input value={form.annualRate} onChange={(event) => updateForm("annualRate", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("loans.form.paymentDay")}><TextField><Input type="number" min="1" max="31" value={form.paymentDay} onChange={(event) => updateForm("paymentDay", event.target.value)} /></TextField></FieldRow>
                <SelectField
                  label={t("loans.form.status")}
                  value={form.status}
                  options={[
                    { value: "active", label: t("loans.status.active") },
                    { value: "paused", label: t("loans.status.paused") },
                    { value: "closed", label: t("loans.status.closed") },
                  ]}
                  onChange={(value) => updateForm("status", value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label={t("loans.form.startDate")}><TextField><Input type="date" value={form.startDate} onChange={(event) => updateForm("startDate", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("loans.form.endDate")}><TextField><Input type="date" value={form.endDate} onChange={(event) => updateForm("endDate", event.target.value)} /></TextField></FieldRow>
              </div>
              <FieldRow label={t("loans.form.note")}><TextField><TextArea value={form.note} onChange={(event) => updateForm("note", event.target.value)} /></TextField></FieldRow>
              {error ? <div className="text-[11px] text-[var(--term-red)]">{error}</div> : null}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onPress={() => setForm(EMPTY_FORM)}>{t("loans.actions.reset")}</Button>
                <Button onPress={() => void submit()} isDisabled={submitting}>{t("loans.actions.save")}</Button>
              </div>
            </div>
          </Card>
        </section>
      </ScrollArea>
      <LoanDetailSheet
        plan={selectedPlan}
        onOpenChange={(open) => {
          if (!open) setSelectedPlanId(null)
        }}
        onEdit={editSelectedPlan}
        onToggleStatus={togglePlanStatus}
        onCloseLoan={(plan) => updatePlan({ id: plan.id, status: "closed" })}
      />
    </main>
  )
}

function LoanDetailSheet({
  plan,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onCloseLoan,
}: {
  plan: PlanSummary | null
  onOpenChange: (open: boolean) => void
  onEdit: (plan: PlanSummary) => void
  onToggleStatus: (plan: PlanSummary) => Promise<void>
  onCloseLoan: (plan: PlanSummary) => Promise<PlanSummary | void>
}) {
  const { t } = useTranslation()
  const institution = plan ? plan.counterparty ?? metaString(plan, "institution") : ""
  const principalRemaining = plan ? Number(metaString(plan, "principalRemaining") || 0) : 0
  const annualRate = plan ? metaString(plan, "annualRate") : ""
  const paymentDay = plan ? metaString(plan, "paymentDay") : ""
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
                {institution || t("loans.title")} · {t(`loans.status.${plan.status}`)}
              </p>
            </Drawer.Header>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,360px)_1fr] divide-x divide-[var(--term-border)]">
              <aside className="flex min-h-0 flex-col gap-4 overflow-auto px-4 pb-4 pt-3">
                <Section title={t("loans.detail.terms")}>
                  <KV label={t("loans.detail.institution")} value={institution || "—"} />
                  <KV label={t("loans.detail.remaining")} value={money(principalRemaining, plan.currency)} />
                  <KV label={t("loans.detail.monthlyPayment")} value={money(Number(plan.amount), plan.currency)} />
                  <KV label={t("loans.detail.rate")} value={annualRate || "—"} />
                  <KV label={t("loans.detail.paymentDay")} value={paymentDay || "—"} />
                  <KV label={t("loans.detail.startDate")} value={plan.startDate} />
                  <KV label={t("loans.detail.endDate")} value={plan.endDate ?? "—"} />
                </Section>
                <Section title={t("loans.detail.progress")}>
                  <KV label={t("loans.detail.nextDue")} value={plan.nextDueDate ?? plan.startDate} />
                  <KV label={t("loans.detail.status")} value={t(`loans.status.${plan.status}`)} />
                  <KV label={t("loans.detail.note")} value={note || "—"} />
                </Section>
                <Section title={t("loans.detail.actions")}>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onPress={() => onEdit(plan)}>{t("loans.actions.edit")}</Button>
                    <Button variant="outline" size="sm" onPress={() => void onToggleStatus(plan)}>
                      {plan.status === "active" ? t("loans.actions.pause") : t("loans.actions.resume")}
                    </Button>
                    {plan.status !== "closed" ? (
                      <Button variant="ghost" size="sm" onPress={() => void onCloseLoan(plan)}>{t("loans.actions.close")}</Button>
                    ) : null}
                  </div>
                </Section>
              </aside>
              <section className="flex min-h-0 flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-2">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">
                    {t("loans.detail.schedule")}
                  </h2>
                  <span className="font-mono text-[11px] text-[var(--term-ink-3)]">0</span>
                </div>
                <div className="px-4 py-4 text-[11px] text-[var(--term-ink-3)]">{t("loans.listDescription")}</div>
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
