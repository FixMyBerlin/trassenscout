import { formatDistance, formatDistanceToNow, isPast } from "date-fns"
import { de } from "date-fns/locale"

export const getFormatDistanceInDays = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate) return "(unbekannt)"
  if (isPast(endDate)) return formatDistance(startDate, endDate, { locale: de })
  return formatDistanceToNow(startDate, { locale: de })
}
