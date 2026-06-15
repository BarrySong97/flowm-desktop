/**
 * @purpose Re-export assets API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Assets use-case module.
 * @gotcha  New implementation code should import from use-cases/assets directly.
 */

export * from "../use-cases/assets/assets-api"
