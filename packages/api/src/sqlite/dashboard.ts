/**
 * @purpose Re-export dashboard API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Dashboard use-case module.
 * @gotcha  New implementation code should import from use-cases/dashboard directly.
 */

export * from "../use-cases/dashboard/dashboard-api"
