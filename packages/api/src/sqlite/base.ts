/**
 * @purpose Re-export SQLite API base compatibility imports after layered refactor.
 * @role    Transitional module for existing package-internal imports.
 * @deps    Infrastructure SQLite base and shared API helpers.
 * @gotcha  New implementation code should import infrastructure or shared helpers directly.
 */

export * from "../infrastructure/db/sqlite-api-base"
