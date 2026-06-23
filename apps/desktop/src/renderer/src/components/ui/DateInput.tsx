/**
 * @purpose Date-only input backed by the app's HeroUI DatePicker composition.
 * @role    Renderer-local form control for ISO date strings.
 * @deps    HeroUI Calendar/DateField/DatePicker and @internationalized/date.
 * @gotcha  Stores dates as YYYY-MM-DD strings so renderer forms match API contracts.
 */

import { Calendar, DateField, DatePicker } from "@heroui/react"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  isInvalid?: boolean
  popoverPlacement?: "top" | "bottom"
}

export function DateInput({
  value,
  onChange,
  isInvalid,
  popoverPlacement = "top",
}: DateInputProps) {
  return (
    <DatePicker
      value={value ? parseDate(value) : null}
      onChange={(next: DateValue | null) => {
        if (next) onChange(next.toString())
      }}
    >
      <DateField.Group fullWidth variant="secondary" isInvalid={isInvalid}>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover placement={popoverPlacement} style={{ maxWidth: "none" }}>
        <Calendar>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  )
}
