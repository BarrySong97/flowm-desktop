import { createFileRoute } from "@tanstack/react-router"
import { AssetsPage } from "../assets/AssetsPage"

export const Route = createFileRoute("/assets")({
  component: AssetsPage,
})
