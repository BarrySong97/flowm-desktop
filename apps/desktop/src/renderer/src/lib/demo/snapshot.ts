import type { DashboardSnapshot } from "@flowm/api"

export const demoSnapshot: DashboardSnapshot = {
  metrics: {
    netWorth: { number: "15567.40", currency: "CNY" },
    cash: { number: "313217.40", currency: "CNY" },
    incomeMtd: { number: "18518.00", currency: "CNY" },
    expenseMtd: { number: "2550.60", currency: "CNY" },
    savingsMtd: { number: "15967.40", currency: "CNY" },
  },
  pnlStrip: [
    { label: "1D", value: "-383.20", delta: "-2.4%", up: false },
    { label: "MTD", value: "15967.40", delta: "LIVE", up: true },
    { label: "INC", value: "18518.00", delta: "2026-05", up: true },
    { label: "EXP", value: "2550.60", delta: "2026-05", up: false },
    { label: "NET", value: "15567.40", delta: "BOOK", up: true },
  ],
  dayFlow: [
    { id: 1, time: "05-01", symbol: "上海知行科技", category: "SALARY", account: "Income:Salary", amountNumber: "-18500.00", currency: "CNY", kind: "income" },
    { id: 2, time: "05-02", symbol: "招商银行", category: "LOANS", account: "Liabilities:Loans:Default", amountNumber: "-300000.00", currency: "CNY", kind: "transfer" },
    { id: 3, time: "05-03", symbol: "盒马鲜生", category: "FOOD", account: "Expenses:Food", amountNumber: "218.90", currency: "CNY", kind: "expense" },
    { id: 4, time: "05-04", symbol: "滴滴出行", category: "TRANSPORT", account: "Expenses:Transport", amountNumber: "46.50", currency: "CNY", kind: "expense" },
    { id: 5, time: "05-05", symbol: "京东数码", category: "SHOPPING", account: "Expenses:Shopping", amountNumber: "899.00", currency: "CNY", kind: "expense" },
    { id: 6, time: "05-06", symbol: "爱奇艺会员", category: "SUBSCRIPTIONS", account: "Expenses:Subscriptions", amountNumber: "25.00", currency: "CNY", kind: "expense" },
    { id: 7, time: "05-08", symbol: "招商银行", category: "INTEREST", account: "Expenses:Interest:Loans", amountNumber: "1360.00", currency: "CNY", kind: "expense" },
    { id: 8, time: "05-10", symbol: "华夏基金", category: "FEES", account: "Expenses:Fees:Investments", amountNumber: "1.20", currency: "CNY", kind: "expense" },
  ],
  transactions: [
    {
      id: 1,
      date: "2026-05-01",
      flag: "*",
      payee: "上海知行科技",
      narration: "五月工资",
      origin: "user",
      meta: null,
      postings: [
        { id: 1, txnId: 1, ordinal: 0, account: "Assets:Bank:Checking", flag: null, units: { number: "18500.00", currency: "CNY" }, meta: null },
        { id: 2, txnId: 1, ordinal: 1, account: "Income:Salary", flag: null, units: { number: "-18500.00", currency: "CNY" }, meta: null },
      ],
    },
    {
      id: 2,
      date: "2026-05-03",
      flag: "*",
      payee: "盒马鲜生",
      narration: "周末采购",
      origin: "user",
      meta: null,
      postings: [
        { id: 3, txnId: 2, ordinal: 0, account: "Expenses:Food", flag: null, units: { number: "218.90", currency: "CNY" }, meta: null },
        { id: 4, txnId: 2, ordinal: 1, account: "Assets:Bank:Checking", flag: null, units: { number: "-218.90", currency: "CNY" }, meta: null },
      ],
    },
    {
      id: 3,
      date: "2026-05-08",
      flag: "*",
      payee: "招商银行",
      narration: "房贷月供",
      origin: "user",
      meta: null,
      postings: [
        { id: 5, txnId: 3, ordinal: 0, account: "Liabilities:Loans:Default", flag: null, units: { number: "2350.00", currency: "CNY" }, meta: null },
        { id: 6, txnId: 3, ordinal: 1, account: "Expenses:Interest:Loans", flag: null, units: { number: "1360.00", currency: "CNY" }, meta: null },
        { id: 7, txnId: 3, ordinal: 2, account: "Assets:Bank:Checking", flag: null, units: { number: "-3710.00", currency: "CNY" }, meta: null },
      ],
    },
  ],
  holdings: [
    { account: "Assets:Bank:Checking", symbol: "CHECKING", name: "Assets:Bank:Checking", type: "ASSETS", balanceNumber: "312242.40", currency: "CNY" },
    { account: "Assets:Wallet:WeChat", symbol: "WECHAT", name: "Assets:Wallet:WeChat", type: "ASSETS", balanceNumber: "975.00", currency: "CNY" },
    { account: "Assets:Investments:Brokerage", symbol: "BROKERAGE", name: "Assets:Investments:Brokerage", type: "ASSETS", balanceNumber: "100.00", currency: "CSI300" },
    { account: "Liabilities:Loans:Default", symbol: "DEFAULT", name: "Liabilities:Loans:Default", type: "LIABILITIES", balanceNumber: "-297650.00", currency: "CNY" },
  ],
  accounts: [],
  generatedAt: new Date(0).toISOString(),
}
