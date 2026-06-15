/**
 * @purpose Re-export subscriptions API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Subscriptions use-case module.
 * @gotcha  New implementation code should import from use-cases/subscriptions directly.
 */

export * from "../use-cases/subscriptions/subscriptions-api"
