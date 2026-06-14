/**
 * @purpose Declare the TanStack Router route for the dashboard index.
 * @role    Route module connecting URL paths to renderer feature components.
 * @deps    TanStack Router and the matching feature page component.
 * @gotcha  Keep route params and component expectations aligned with generated routeTree output.
 */

import { createFileRoute } from "@tanstack/react-router"
import { OverviewPage } from "../dashboard/OverviewPage"

export const Route = createFileRoute("/")({
  component: OverviewPage,
})
