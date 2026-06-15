/**
 * @purpose Hold pure asset domain rules that do not touch persistence or transport.
 * @role    Domain layer for present asset workflows.
 * @deps    Shared asset contract types.
 * @gotcha  Keep asset rules independent from imported cashflow and loan forecasts.
 */

import type { AssetType } from "@flowm/shared/contracts"

export function normalizeAssetType(type: string): AssetType {
  return type === "investment" ? "brokerage" : (type as AssetType)
}
