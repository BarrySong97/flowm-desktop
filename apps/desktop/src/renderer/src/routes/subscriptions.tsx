import { createFileRoute } from "@tanstack/react-router"
import { SubscriptionsPage } from "../subscriptions/SubscriptionsPage"

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
})
