/**
 * @purpose Shared glyphs used across landing sections (kept here so paths aren't duplicated).
 */

/** Provider-neutral「AI Agent」mark (a twinkle) — Flowm works with any agent, not one brand. */
export function AgentIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.85 5.55L19.4 9.4l-5.55 1.85L12 16.8l-1.85-5.55L4.6 9.4l5.55-1.85z" />
      <path
        d="M18.4 14.2l.85 2.45 2.45.85-2.45.85-.85 2.45-.85-2.45-2.45-.85 2.45-.85z"
        opacity="0.55"
      />
    </svg>
  )
}
