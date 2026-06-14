/**
 * @purpose Provide shared UI class-name composition helpers.
 * @role    Utility support for reusable @flowm/ui primitives.
 * @deps    clsx and tailwind-merge.
 * @gotcha  Do not mix product state or data fetching into UI utilities.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
