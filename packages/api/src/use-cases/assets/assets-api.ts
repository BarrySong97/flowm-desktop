/**
 * @purpose Expose present-asset use cases through the Flowm API facade chain.
 * @role    Use-case layer wrapper over asset persistence and workflows.
 * @deps    Assets API repository.
 * @gotcha  Asset snapshots are present-state records, not balances inferred from imports.
 */

import { AssetsApiRepository } from "../../infrastructure/db/repositories/assets-api.repository"
import { mapAssetSnapshot } from "../../presentation/mappers/sqlite-row-mappers"
import type { AssetSnapshotSummary, UpsertAssetSnapshotInput } from "../../index"
import type { Result } from "@flowm/shared"
import { fail, ok } from "../../shared/api-helpers"
import {
  type UpsertAssetSnapshotRepository,
  upsertAssetSnapshotUseCase,
} from "./upsert-asset-snapshot"

export async function upsertAssetSnapshotFacade(
  repository: UpsertAssetSnapshotRepository,
  input: UpsertAssetSnapshotInput,
): Promise<Result<AssetSnapshotSummary>> {
  try {
    const row = await upsertAssetSnapshotUseCase(repository, input)
    return ok(mapAssetSnapshot(row))
  } catch (error) {
    return fail(error)
  }
}

export abstract class AssetsApi extends AssetsApiRepository {
  async upsertAssetSnapshot(
    input: UpsertAssetSnapshotInput,
  ): Promise<Result<AssetSnapshotSummary>> {
    return upsertAssetSnapshotFacade(this.assetRepository(), input)
  }
}
