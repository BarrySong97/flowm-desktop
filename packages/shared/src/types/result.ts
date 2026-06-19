/**
 * @purpose Define reusable Result-style success and failure types.
 * @role    Shared error-handling primitive for code that avoids throwing across boundaries.
 * @deps    TypeScript discriminated unions.
 * @gotcha  Keep the shape small so API and renderer callers can narrow predictably.
 */

// Safe result wrapper used at adapter boundaries.
// Internal code throws; we only narrow to Result<T> when crossing into UI / IPC.
export type Result<T> = { success: true; data: T } | { success: false; error: string }
