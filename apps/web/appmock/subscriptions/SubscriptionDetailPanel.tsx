/**
 * @purpose Interaction-only stub for the ported Subscriptions page.
 * @role    The real detail panel only renders after a subscription is selected; the static mock
 *          never selects one, so this stub returns null to keep the default calendar view intact.
 */

export function SubscriptionDetailPanel(_props: { id: string; onBack: () => void }) {
  return null
}
