/**
 * @purpose Restrained brand creed statement.
 * @role    Landing section: single centered manifesto line.
 */

import { Wrap } from "./primitives"

export function Creed() {
  return (
    <section className="py-[110px] text-center">
      <Wrap>
        <p className="mx-auto max-w-[780px] text-[clamp(28px,4.2vw,46px)] font-light leading-[1.32] -tracking-[0.02em] text-ink">
          Flowm 不让你的钱<b className="font-semibold">变多</b>，
          <br />
          它让你<b className="font-semibold">看清</b>你的钱。
        </p>
        <div className="mt-[30px] text-[13px] tracking-[0.02em] text-ink-3">
          只呈现，不替你判断 — 这是 Flowm 的全部克制
        </div>
      </Wrap>
    </section>
  )
}
