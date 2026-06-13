import { createFileRoute } from "@tanstack/react-router"
import { SubscriptionDetailPage } from "../subscriptions/SubscriptionDetailPage"

export const Route = createFileRoute("/subscriptions/$id")({
  component: SubscriptionDetailPage,
})
