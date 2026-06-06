import { Toaster as SonnerToaster, toast } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "font-mono border border-[var(--term-border-hi)] bg-[var(--term-panel)] text-[var(--term-ink-1)]",
        },
      }}
    />
  )
}

export const notify = {
  success: toast.success,
  error: toast.error,
  message: toast.message,
}
