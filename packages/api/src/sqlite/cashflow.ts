/**
 * @purpose Re-export cashflow API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Cashflow use-case module.
 * @gotcha  New implementation code should import from use-cases/cashflow directly.
 */

export * from "../use-cases/cashflow/cashflow-api"
