/**
 * @purpose Re-export loans API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Loans use-case module.
 * @gotcha  New implementation code should import from use-cases/loans directly.
 */

export * from "../use-cases/loans/loans-api"
