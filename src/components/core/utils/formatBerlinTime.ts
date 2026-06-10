import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export const formatBerlinTime = (date: Date | string, formatString: string = "dd.MM.yyyy") => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const berlinDate = new TZDate(dateObj, "Europe/Berlin")
  return format(berlinDate, formatString, { locale: de })
}
