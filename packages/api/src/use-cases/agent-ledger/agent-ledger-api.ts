/**
 * @purpose Expose guarded agent ledger patch workflows through the Flowm API facade chain.
 * @role    Use-case layer wrapper over agent ledger persistence and rules.
 * @deps    Agent ledger API repository.
 * @gotcha  Agent patches express business operations, never arbitrary SQLite writes.
 */

import { AgentLedgerApiRepository } from "../../infrastructure/db/repositories/agent-ledger-api.repository"

export abstract class AgentLedgerApi extends AgentLedgerApiRepository {}
