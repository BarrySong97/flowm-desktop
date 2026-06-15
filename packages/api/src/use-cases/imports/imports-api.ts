/**
 * @purpose Expose import workflows through the Flowm API facade chain.
 * @role    Use-case layer wrapper over import persistence.
 * @deps    Imports API repository.
 * @gotcha  Imported statements remain evidence until explicit conversion creates cashflow.
 */

import { ImportsApiRepository } from "../../infrastructure/db/repositories/imports-api.repository"

export abstract class ImportsApi extends ImportsApiRepository {}
