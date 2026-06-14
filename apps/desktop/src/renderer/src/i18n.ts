/**
 * @purpose Configure renderer internationalization resources and language fallback.
 * @role    Shared i18n setup imported by the React app.
 * @deps    i18next resources under renderer locales.
 * @gotcha  Keep translation keys stable for tests and localized UI.
 */

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enUS from "./locales/en-US/translation.json"
import zhCN from "./locales/zh-CN/translation.json"

export const supportedLanguages = [
  { label: "EN", name: "English", value: "en-US" },
  { label: "中文", name: "简体中文", value: "zh-CN" },
] as const

type SupportedLanguage = (typeof supportedLanguages)[number]["value"]

function detectLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return "en-US"
  const preferred = [navigator.language, ...(navigator.languages ?? [])]
    .filter(Boolean)
    .map((language) => language.toLowerCase())

  return preferred.some((language) => language.startsWith("zh")) ? "zh-CN" : "en-US"
}

void i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: enUS },
    "zh-CN": { translation: zhCN },
  },
  lng: detectLanguage(),
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
  supportedLngs: supportedLanguages.map((language) => language.value),
})

i18n.on("languageChanged", (language) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language
  }
})

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language
}

export { i18n }
