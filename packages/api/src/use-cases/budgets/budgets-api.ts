/**
 * @purpose Expose budget use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over budget persistence.
 * @deps    Budgets API repository.
 * @gotcha  Budgets are planning boundaries and only reference cashflow for progress.
 */

import { BudgetsApiRepository } from "../../infrastructure/db/repositories/budgets-api.repository"

export abstract class BudgetsApi extends BudgetsApiRepository {}
