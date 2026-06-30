/**
 * @purpose Provide reusable cashflow filter controls (select + date range) shared across surfaces.
 * @role    Renderer presentational primitives for the imports page and the cashflow link picker.
 * @deps    HeroUI Select/ListBox/DateRangePicker, @internationalized/date, and the FormField atom.
 * @gotcha  Stateless controls only — callers own filter state; no URL/nuqs sync lives here.
 */

import { DateField, DateRangePicker, ListBox, RangeCalendar, Select } from "@heroui/react"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import { FormField } from "../components/ui/FormField"

export const FILTER_LABEL_CLASS = "mb-1 block text-[10.5px] leading-[1.2] text-[var(--ink-3)]"

export function FilterSelectField({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string
  options: Array<{ key: string; label: string }>
  onChange: (value: string) => void
  className: string
}) {
  return (
    <div className={className}>
      <FormField label={label} labelClassName={FILTER_LABEL_CLASS}>
        <Select
          variant="secondary"
          selectedKey={value}
          onSelectionChange={(key) => {
            if (key == null) return
            const next = String(key)
            if (next !== value) onChange(next)
          }}
        >
          <Select.Trigger className="h-[30px] min-h-[30px] px-2 text-[11.5px]">
            <Select.Value className="text-[11.5px]" />
            <Select.Indicator className="size-3" />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {options.map((option) => (
                <ListBox.Item key={option.key} id={option.key} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FormField>
    </div>
  )
}

type DateRangeValue = { start: DateValue; end: DateValue }

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: { from: string; to: string }
  onChange: (next: { from: string; to: string }) => void
}) {
  const rangeValue: DateRangeValue | null =
    value.from && value.to ? { start: parseDate(value.from), end: parseDate(value.to) } : null

  return (
    <DateRangePicker
      className="w-full"
      value={rangeValue}
      onChange={(next: DateRangeValue | null) => {
        onChange({
          from: next?.start.toString() ?? "",
          to: next?.end.toString() ?? "",
        })
      }}
    >
      <DateField.Group
        fullWidth
        variant="secondary"
        className="h-[30px] min-h-[30px] px-2 text-[11.5px]"
      >
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator className="px-1 text-[var(--ink-4)]">
          至
        </DateRangePicker.RangeSeparator>
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover placement="bottom" style={{ maxWidth: "none" }}>
        <RangeCalendar>
          <RangeCalendar.Header>
            <RangeCalendar.YearPickerTrigger>
              <RangeCalendar.YearPickerTriggerHeading />
              <RangeCalendar.YearPickerTriggerIndicator />
            </RangeCalendar.YearPickerTrigger>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
      </DateRangePicker.Popover>
    </DateRangePicker>
  )
}
