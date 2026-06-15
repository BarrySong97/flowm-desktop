/**
 * @purpose Expose loan forecast use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over loan persistence.
 * @deps    Loans API repository.
 * @gotcha  Loan plans are future obligations; net-worth liabilities come from asset snapshots.
 */

import { LoansApiRepository } from "../../infrastructure/db/repositories/loans-api.repository"

export abstract class LoansApi extends LoansApiRepository {}
