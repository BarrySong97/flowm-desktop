import { createFileRoute } from "@tanstack/react-router"
import { CategoriesPage } from "../settings/CategoriesPage"

export const Route = createFileRoute("/settings-categories")({
  component: CategoriesPage,
})
