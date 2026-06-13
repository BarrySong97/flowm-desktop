import { createFileRoute } from "@tanstack/react-router"
import { BudgetDetailPage } from "../budget/BudgetDetailPage"

export const Route = createFileRoute("/budget/$id")({
  component: BudgetDetailPage,
})
