/**
 * @purpose Expose past cashflow use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over cashflow persistence.
 * @deps    Cashflow API repository.
 * @gotcha  Cashflow records describe past activity and must not infer present asset balances.
 */

import { CashflowApiRepository } from "../../infrastructure/db/repositories/cashflow-api.repository"

export abstract class CashflowApi extends CashflowApiRepository {}
