import { createFileRoute } from "@tanstack/react-router"
import { ImportsPage } from "../imports/ImportsPage"

export const Route = createFileRoute("/imports")({
  component: ImportsPage,
})
