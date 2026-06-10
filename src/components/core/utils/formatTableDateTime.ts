import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"
import { de } from "date-fns/locale"

/** Input accepted by {@link formatTableDateTime}. */
export type TableDateTimeInput = Date | string | null | undefined

/**
 * Two-line table datetime content (date on first line, time on second).
 * Returns `null` when the value is missing or not a valid date.
 */
export type TableDateTimeContent = {
  /** ISO string for `<time dateTime>`. */
  dateTime: string
  /** First line, e.g. `03.06.2026`. */
  date: string
  /** Second line, e.g. `16:15`. */
  time: string
}

const toBerlinDate = (value: Date | string) => {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new TZDate(parsed, "Europe/Berlin")
}

/** Formats a value as German table date + time parts in Europe/Berlin. */
export const formatTableDateTime = (value: TableDateTimeInput) => {
  if (value == null) return null

  const berlinDate = toBerlinDate(value)
  if (!berlinDate) return null

  return {
    dateTime: berlinDate.toISOString(),
    date: format(berlinDate, "P", { locale: de }),
    time: format(berlinDate, "HH:mm", { locale: de }),
  }
}
