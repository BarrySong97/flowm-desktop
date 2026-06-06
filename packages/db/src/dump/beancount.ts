import type { StorageAdapter, TransactionRecord } from "../adapters/types"
import type { Result } from "@flowm/shared"

function expectOk<T>(result: Result<T>): T {
  if (result.success) return result.data as T
  throw new Error(result.error)
}

function quote(input: string): string {
  return `"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

function formatTransactionHeader(txn: TransactionRecord): string {
  if (txn.payee == null) {
    return `${txn.date} ${txn.flag} ${quote(txn.narration)}`
  }
  return `${txn.date} ${txn.flag} ${quote(txn.payee)} ${quote(txn.narration)}`
}

function formatPosting(posting: TransactionRecord["postings"][number]): string {
  const parts = [`  ${posting.account}`]
  if (posting.units != null) {
    parts.push(`${posting.units.number} ${posting.units.currency}`)
  }
  if (posting.cost != null) {
    const label = posting.cost.label == null ? "" : `, ${quote(posting.cost.label)}`
    parts.push(
      `{${posting.cost.number} ${posting.cost.currency}, ${posting.cost.date}${label}}`,
    )
  }
  if (posting.price != null) {
    parts.push(
      `${posting.price.total ? "@@" : "@"} ${posting.price.amount.number} ${posting.price.amount.currency}`,
    )
  }
  return parts.join("  ")
}

export async function dumpBeancount(adapter: StorageAdapter): Promise<string> {
  const commodities = expectOk(await adapter.listCommodities())
  const accounts = expectOk(await adapter.listAccounts())
  const transactions = expectOk(await adapter.listTransactions())

  const lines: string[] = []

  for (const commodity of commodities) {
    if (commodity.declaredAt != null) {
      lines.push(`${commodity.declaredAt} commodity ${commodity.currency}`)
    }
  }

  if (lines.length > 0) lines.push("")

  for (const account of accounts) {
    const currencies =
      account.allowedCurrencies.length === 0
        ? ""
        : ` ${account.allowedCurrencies.join(",")}`
    lines.push(`${account.openedAt} open ${account.name}${currencies}`)
  }

  if (accounts.length > 0) lines.push("")

  for (const txn of transactions) {
    lines.push(formatTransactionHeader(txn))
    for (const posting of txn.postings) {
      lines.push(formatPosting(posting))
    }
    lines.push("")
  }

  for (const account of accounts) {
    if (account.closedAt != null) {
      lines.push(`${account.closedAt} close ${account.name}`)
    }
  }

  return `${lines.join("\n").trimEnd()}\n`
}
