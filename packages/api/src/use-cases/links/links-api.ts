/**
 * @purpose Expose explanatory object-link use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over link persistence.
 * @deps    Links API repository.
 * @gotcha  Links explain relationships and must not change core cashflow or asset aggregates.
 */

import { LinksApiRepository } from "../../infrastructure/db/repositories/links-api.repository"

export abstract class LinksApi extends LinksApiRepository {}
