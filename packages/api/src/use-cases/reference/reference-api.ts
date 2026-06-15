/**
 * @purpose Expose reference-data use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over reference persistence.
 * @deps    Reference API repository.
 * @gotcha  Keep Drizzle and schema imports in infrastructure repositories, not here.
 */

import { ReferenceApiRepository } from "../../infrastructure/db/repositories/reference-api.repository"

export abstract class ReferenceApi extends ReferenceApiRepository {}
