/**
 * @purpose Re-export links API use-case compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Links use-case module.
 * @gotcha  New implementation code should import from use-cases/links directly.
 */

export * from "../use-cases/links/links-api"
