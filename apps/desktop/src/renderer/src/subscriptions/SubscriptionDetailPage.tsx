/**
 * @purpose Render and manage the subscription detail page workflow.
 * @role    Renderer feature surface for recurring future obligations.
 * @deps    React, tRPC subscription queries, calendar/list UI, and forms.
 * @gotcha  Subscription occurrences are forecasts until an explicit actual-cashflow workflow records them.
 */

import { useNavigate } from "@tanstack/react-router"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Route } from "../routes/subscriptions.$id"
import { SubscriptionDetailPanel } from "./SubscriptionDetailPanel"

export function SubscriptionDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>
      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
        <SubscriptionDetailPanel id={id} onBack={() => navigate({ to: "/subscriptions" })} />
      </ScrollArea>
      <Dock />
    </div>
  )
}
