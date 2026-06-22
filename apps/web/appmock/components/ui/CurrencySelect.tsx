/**
 * @purpose Currency picker: a type-to-filter combobox over the common-currency set.
 * @role    Renderer-local form control reused by asset, subscription, loan, and settings forms.
 * @deps    HeroUI ComboBox/Input/ListBox and the @flowm/shared currency registry.
 * @gotcha  Stores the ISO code (uppercase); custom values are disallowed so only listed
 *          currencies can be picked. Filtering matches both code and localized name.
 */

import { COMMON_CURRENCIES, type CurrencyMeta } from "@flowm/shared"
import { ComboBox, Input, ListBox } from "@heroui/react"

interface CurrencySelectProps {
  value: string
  onChange: (code: string) => void
  ariaLabel?: string
  isDisabled?: boolean
  className?: string
}

export function CurrencySelect({
  value,
  onChange,
  ariaLabel = "币种",
  isDisabled,
  className,
}: CurrencySelectProps) {
  return (
    <ComboBox
      aria-label={ariaLabel}
      variant="secondary"
      className={className}
      isDisabled={isDisabled}
      // selectedKey expects Key | null; an empty string means "unset".
      selectedKey={value ? value.toUpperCase() : null}
      defaultItems={COMMON_CURRENCIES}
      allowsCustomValue={false}
      onSelectionChange={(key) => {
        if (key == null) return
        onChange(String(key))
      }}
    >
      <ComboBox.InputGroup>
        <Input variant="secondary" placeholder="搜索币种" className="text-[12px]" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {(item: CurrencyMeta) => (
            <ListBox.Item key={item.code} id={item.code} textValue={`${item.code} ${item.name}`}>
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 600, minWidth: 38 }}>{item.code}</span>
                <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{item.symbol}</span>
                <span style={{ color: "var(--ink-2)" }}>{item.name}</span>
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  )
}
