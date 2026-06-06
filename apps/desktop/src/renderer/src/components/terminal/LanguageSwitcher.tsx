import { ListBox, ListBoxItem, Select } from "@heroui/react"
import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import { supportedLanguages, type SupportedLanguage } from "../../i18n"

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const language = (i18n.resolvedLanguage ?? i18n.language) as SupportedLanguage

  return (
    <Select
      aria-label={t("language.label")}
      selectedKey={language}
      onSelectionChange={(key) => {
        if (key != null) void i18n.changeLanguage(String(key))
      }}
    >
      <Select.Trigger className="flex h-[26px] items-center gap-1 rounded-[6px] border border-[var(--term-border-hi)] bg-[var(--term-input)] px-2 text-[11px] text-[var(--term-ink-2)]">
        <Languages className="size-3 text-[var(--term-ink-3)]" />
        <span className="hidden xl:inline">{t("language.label")}</span>
        <Select.Value className="text-[11px]" />
        <Select.Indicator className="size-3" />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {supportedLanguages.map((item) => (
            <ListBoxItem key={item.value} id={item.value}>
              {item.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
