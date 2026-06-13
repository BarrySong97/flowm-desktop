import { createFileRoute } from "@tanstack/react-router"
import { LoanDetailPage } from "../loans/LoanDetailPage"

export const Route = createFileRoute("/loans/$id")({
  component: LoanDetailPage,
})
