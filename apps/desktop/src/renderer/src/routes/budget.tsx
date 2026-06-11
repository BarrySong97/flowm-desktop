import { createFileRoute } from "@tanstack/react-router"
import { BudgetPage } from "../budget/BudgetPage"

export const Route = createFileRoute("/budget")({
  component: BudgetPage,
})
