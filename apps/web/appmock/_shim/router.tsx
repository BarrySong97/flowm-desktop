/**
 * @purpose Mock @tanstack/react-router primitives so verbatim-copied renderer pages compile.
 * @role    Drop-in Link + useRouterState replacements for the marketing app mock.
 * @gotcha  Navigation is inert; `to`/`preload` and friends are accepted then ignored.
 */

import type { AnchorHTMLAttributes, ReactNode } from "react"

// The mocked "current path". Ported pages that guard on their route (e.g.
// `if (pathname !== "/budget") return <Outlet />`) set this at module load so
// their default view renders. Defaults to "/" for pages that never read it.
let mockPathname = "/"

/** Set the path reported by `useRouterState`. Inert beyond driving render guards. */
export function setMockPathname(path: string): void {
  mockPathname = path
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to?: string
  preload?: unknown
  params?: unknown
  search?: unknown
  children?: ReactNode
}

export function Link({
  to: _to,
  preload: _preload,
  params: _params,
  search: _search,
  children,
  className,
  style,
  ...rest
}: LinkProps) {
  return (
    <a className={className} style={style} {...rest}>
      {children}
    </a>
  )
}

interface RouterState {
  location: { pathname: string }
}

export function useRouterState<T = RouterState>(opts?: { select?: (state: RouterState) => T }): T {
  const state: RouterState = { location: { pathname: mockPathname } }
  return opts?.select ? opts.select(state) : (state as unknown as T)
}

/** Inert outlet: nested routes are never mounted in the mock. */
export function Outlet(): null {
  return null
}

/** Inert navigate: clicking rows in the mock does nothing. */
export function useNavigate(): (opts?: unknown) => void {
  return () => {}
}

/** Inert router handle. Only `navigate` is used by the mock; it resolves immediately. */
export function useRouter(): { navigate: (opts?: unknown) => Promise<void> } {
  return { navigate: async () => {} }
}
