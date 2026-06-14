/**
 * @purpose Create the minimal default reference data for a new Flowm ledger.
 * @role    Seed helper used when initializing empty databases.
 * @deps    @flowm/db schema and Drizzle database handle.
 * @gotcha  Default data must not masquerade as user-entered cashflow or balances.
 */

import { categories, type CategoryInsert, type Database } from "@flowm/db"
import { newId, nowIso } from "./sqlite/base"

type DefaultCategory = {
  name: string
  categoryKind: CategoryInsert["categoryKind"]
  color: string
}

// The default category set a fresh personal ledger needs, and the names the demo
// ledger references (see packages/api/src/demo-seed.ts). Order drives display_order.
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "收入", categoryKind: "income", color: "#14794a" },
  { name: "餐饮", categoryKind: "expense", color: "#e07b3a" },
  { name: "交通", categoryKind: "expense", color: "#4a8fc4" },
  { name: "购物", categoryKind: "expense", color: "#c4694a" },
  { name: "娱乐", categoryKind: "expense", color: "#a86fc4" },
  { name: "居住", categoryKind: "expense", color: "#7c8a52" },
  { name: "通讯", categoryKind: "expense", color: "#4a9d94" },
  { name: "订阅", categoryKind: "expense", color: "#7c6ac4" },
  { name: "其他", categoryKind: "expense", color: "#8a9590" },
  { name: "转账", categoryKind: "transfer", color: "#6b7d72" },
  { name: "退款", categoryKind: "income", color: "#6f9f6b" },
  { name: "还款", categoryKind: "debt", color: "#8b6a47" },
]

/**
 * Seed the default category set into a ledger. Idempotent: categories whose name
 * already exists are skipped, so it is safe to call on every ledger creation.
 */
export async function seedDefaultCategories(db: Database): Promise<void> {
  const existing = new Set(db.select({ name: categories.name }).from(categories).all().map((row) => row.name))
  const timestamp = nowIso()
  DEFAULT_CATEGORIES.forEach((category, index) => {
    if (existing.has(category.name)) return
    db.insert(categories)
      .values({
        id: newId("cat"),
        name: category.name,
        categoryKind: category.categoryKind,
        color: category.color,
        displayOrder: index,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .run()
  })
}
