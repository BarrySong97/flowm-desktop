/**
 * @purpose Re-export reference API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Reference use-case module.
 * @gotcha  New implementation code should import from use-cases/reference directly.
 */

export * from "../use-cases/reference/reference-api"
