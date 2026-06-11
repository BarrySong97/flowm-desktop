import { createFileRoute } from "@tanstack/react-router"
import { OverviewPage } from "../dashboard/OverviewPage"

export const Route = createFileRoute("/")({
  component: OverviewPage,
})
