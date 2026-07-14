/**
 * @purpose Evaluate Velite's compiled MDX function body into React elements.
 * @role    Canonical renderer for generated article code.
 * @deps    React JSX runtime and BlogImage.
 * @gotcha  Static export evaluates this while prerendering; add shared MDX
 *          components here rather than parsing source files at runtime.
 */

import type { ComponentType } from "react"
import * as runtime from "react/jsx-runtime"
import { BlogImage } from "./BlogImage"

const sharedComponents: Record<string, ComponentType<any>> = { BlogImage }

function useMDXComponent(code: string): ComponentType<{
  components?: Record<string, ComponentType<any>>
}> {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

interface MDXContentProps {
  code: string
  components?: Record<string, ComponentType<any>>
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDXComponent(code)
  return <Component components={{ ...sharedComponents, ...components }} />
}
