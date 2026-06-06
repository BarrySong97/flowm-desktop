import { createFileRoute } from "@tanstack/react-router"
import { TerminalApp } from "../components/terminal/TerminalApp"

export const Route = createFileRoute("/")({
  component: TerminalApp,
})
