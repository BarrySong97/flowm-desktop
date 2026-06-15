/**
 * @purpose Expose subscription forecast use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over subscription persistence.
 * @deps    Subscriptions API repository.
 * @gotcha  Subscription occurrences are forecasts unless an explicit workflow creates actual cashflow.
 */

import { SubscriptionsApiRepository } from "../../infrastructure/db/repositories/subscriptions-api.repository"

export abstract class SubscriptionsApi extends SubscriptionsApiRepository {}
