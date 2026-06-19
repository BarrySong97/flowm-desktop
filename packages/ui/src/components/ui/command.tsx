/**
 * @purpose Render the command renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import { Command as CommandPrimitive } from "cmdk"
import { cn } from "../../lib/utils"

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive className={cn("font-mono text-[var(--term-ink-1)]", className)} {...props} />
  )
}

export function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <CommandPrimitive.Input
      className={cn(
        "h-8 w-full bg-[var(--term-input)] px-2 font-mono text-[12px] outline-none",
        className,
      )}
      {...props}
    />
  )
}

export const CommandList = CommandPrimitive.List
export const CommandItem = CommandPrimitive.Item
export const CommandEmpty = CommandPrimitive.Empty
export const CommandGroup = CommandPrimitive.Group
