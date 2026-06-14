/**
 * @purpose Re-export shared type modules from @flowm/shared.
 * @role    Type aggregation point for package consumers.
 * @deps    Local shared type files.
 * @gotcha  Keep exports stable and platform-light.
 */

export * from "./beancount"
export * from "./result"
