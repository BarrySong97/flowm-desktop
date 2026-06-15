/**
 * @purpose Re-export budgets API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Budgets use-case module.
 * @gotcha  New implementation code should import from use-cases/budgets directly.
 */

export * from "../use-cases/budgets/budgets-api"
