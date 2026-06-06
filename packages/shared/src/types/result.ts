// Safe result wrapper used at adapter boundaries.
// Internal code throws; we only narrow to Result<T> when crossing into UI / IPC.
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }
