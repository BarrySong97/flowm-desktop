/**
 * @purpose Verify i18n.test behavior in the renderer test suite.
 * @role    Regression test for renderer utilities and shared UI behavior.
 * @deps    Vitest and the module under test.
 * @gotcha  Keep assertions deterministic and independent of live SQLite data.
 */

import { describe, expect, it } from "vitest"
import { i18n, supportedLanguages } from "../i18n"

describe("i18n", () => {
  it("loads English and Simplified Chinese client-side resources", () => {
    expect(supportedLanguages.map((language) => language.value)).toEqual(["en-US", "zh-CN"])
    expect(i18n.t("toolbar.refresh", { lng: "en-US" })).toBe("REFRESH")
    expect(i18n.t("toolbar.refresh", { lng: "zh-CN" })).toBe("刷新")
  })
})
