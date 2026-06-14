/**
 * @purpose Declare the TanStack Router route for the settings-categories screen.
 * @role    Route module connecting URL paths to renderer feature components.
 * @deps    TanStack Router and the matching feature page component.
 * @gotcha  Keep route params and component expectations aligned with generated routeTree output.
 */

import { createFileRoute } from "@tanstack/react-router"
import { CategoriesPage } from "../settings/CategoriesPage"

export const Route = createFileRoute("/settings-categories")({
  component: CategoriesPage,
})
