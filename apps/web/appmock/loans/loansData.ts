/**
 * @purpose Register static mock data for the ported Loans page's tRPC queries.
 * @role    Side-effect-free dataset: pass to <MockProvider data={loansData}> so the
 *          verbatim-copied LoansPage renders realistic Chinese loan numbers.
 * @deps    @mock/lib/trpc registry. Dates are anchored near 2026-06-21.
 * @gotcha  loans.list + loans.occurrences feed buildLoanSchedule; "paid" occurrences
 *          drive the filled progress segments, future periods are amortization estimates.
 */

// ── Loans ─────────────────────────────────────────────────────────────────
// Four active loans; total currentPrincipalEstimate ≈ ¥4.3M, monthly ≈ ¥20k.
type LoanRow = {
  id: string
  name: string
  lender: string
  currency: string
  principalAmount: string
  currentPrincipalEstimate: string
  annualRateBps: number
  repaymentMethod: string
  paymentAmount: string
  paymentDay: number
  startDate: string
  termMonths: number
  status: string
  note: string | null
}

const loansList: LoanRow[] = [
  {
    id: "loan-1",
    name: "招商银行房贷",
    lender: "招商银行",
    currency: "CNY",
    principalAmount: "4000000",
    currentPrincipalEstimate: "2800000",
    annualRateBps: 415,
    repaymentMethod: "equal_installment",
    paymentAmount: "9800",
    paymentDay: 22,
    startDate: "2018-07-22",
    termMonths: 360,
    status: "active",
    note: null,
  },
  {
    id: "loan-2",
    name: "建设银行车贷",
    lender: "建设银行",
    currency: "CNY",
    principalAmount: "300000",
    currentPrincipalEstimate: "120000",
    annualRateBps: 560,
    repaymentMethod: "equal_installment",
    paymentAmount: "4500",
    paymentDay: 8,
    startDate: "2023-09-08",
    termMonths: 60,
    status: "active",
    note: null,
  },
  {
    id: "loan-3",
    name: "工商银行房贷",
    lender: "工商银行",
    currency: "CNY",
    principalAmount: "2000000",
    currentPrincipalEstimate: "1200000",
    annualRateBps: 430,
    repaymentMethod: "equal_installment",
    paymentAmount: "4200",
    paymentDay: 15,
    startDate: "2019-03-15",
    termMonths: 240,
    status: "active",
    note: null,
  },
  {
    id: "loan-4",
    name: "浦发装修贷",
    lender: "浦发银行",
    currency: "CNY",
    principalAmount: "250000",
    currentPrincipalEstimate: "180000",
    annualRateBps: 620,
    repaymentMethod: "equal_installment",
    paymentAmount: "1500",
    paymentDay: 5,
    startDate: "2024-12-05",
    termMonths: 36,
    status: "active",
    note: null,
  },
]

// ── Occurrences ─────────────────────────────────────────────────────────────
// Per-loan repayment history + the next due period. Paid occurrences (status
// "paid") fill the schedule bar; the rest of each term is forecast on the fly.
type OccurrenceRow = {
  id: string
  loanId: string
  dueDate: string
  paymentAmount: string
  principalAmount: string
  interestAmount: string
  feeAmount: string
  remainingPrincipalEstimate: string
  status: string
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z")
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}

// Build `paidCount` paid occurrences + 1 upcoming scheduled occurrence for a loan,
// amortizing from the original principal so principal/interest look believable.
function buildOccurrences(loan: LoanRow, paidCount: number): OccurrenceRow[] {
  const rows: OccurrenceRow[] = []
  const monthly = Number(loan.paymentAmount)
  const monthlyRate = loan.annualRateBps / 100 / 100 / 12
  let balance = Number(loan.principalAmount)
  const total = paidCount + 1
  for (let k = 0; k < total; k += 1) {
    const interest = Math.round(balance * monthlyRate * 100) / 100
    const principal = Math.round(Math.max(monthly - interest, 0) * 100) / 100
    balance = Math.max(0, Math.round((balance - principal) * 100) / 100)
    const dueDate = addMonths(loan.startDate, k)
    rows.push({
      id: `occ-${loan.id}-${k}`,
      loanId: loan.id,
      dueDate,
      paymentAmount: monthly.toFixed(2),
      principalAmount: principal.toFixed(2),
      interestAmount: interest.toFixed(2),
      feeAmount: "0",
      remainingPrincipalEstimate: balance.toFixed(2),
      status: k < paidCount ? "paid" : "scheduled",
    })
  }
  return rows
}

// Paid period counts chosen so the bars show meaningful progress per loan.
const loansOccurrences: OccurrenceRow[] = [
  ...buildOccurrences(loansList[0], 95), // 招商银行房贷 · 360 期
  ...buildOccurrences(loansList[1], 33), // 建设银行车贷 · 60 期
  ...buildOccurrences(loansList[2], 87), // 工商银行房贷 · 240 期
  ...buildOccurrences(loansList[3], 18), // 浦发装修贷 · 36 期
]

// ── Future pressure ──────────────────────────────────────────────────────────
// 60-day fixed-outflow forecast. loans ≈ monthly sum (¥20k); a few subscriptions
// nudge the total so "占每月固定支出" shows a realistic sub-100% share.
const loansFuturePressure = {
  subscriptions: "320",
  loans: "20000",
  total: "20320",
  currency: "CNY",
}

// ── Assets (liability snapshot for the optional credit-card row) ──────────────
const assetsSnapshots = [
  {
    id: "as-card",
    assetItemId: "ai-card",
    accountName: "招商银行信用卡",
    assetType: "liability",
    snapshotAt: "2026-06-18",
    quantityNumber: null,
    quantityCurrency: null,
    quantityAmount: null,
    quantityUnit: null,
    valueNumber: "-18600",
    valueCurrency: "CNY",
    source: "manual",
    note: "本期账单",
    meta: null,
  },
]

// ── Reference / FX ────────────────────────────────────────────────────────────
const referenceCurrentRates = {
  base: "CNY",
  asOf: "2026-06-21",
  rates: {
    USD: "7.18",
    EUR: "7.82",
    HKD: "0.92",
    JPY: "0.046",
  },
}

export const loansData: Record<string, unknown> = {
  "loans.list": loansList,
  "loans.occurrences": loansOccurrences,
  "loans.futurePressure": loansFuturePressure,
  "assets.snapshots": assetsSnapshots,
  "reference.currentRates": referenceCurrentRates,
}
