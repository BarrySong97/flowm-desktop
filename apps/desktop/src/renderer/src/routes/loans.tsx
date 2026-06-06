import { createFileRoute } from "@tanstack/react-router"
import { LoansPage } from "../loans/LoansPage"

export const Route = createFileRoute("/loans")({
  component: LoansPage,
})
