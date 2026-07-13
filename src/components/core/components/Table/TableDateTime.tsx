import { twJoin } from "tailwind-merge"
import {
  formatTableDateTime,
  type TableDateTimeInput,
} from "@/src/components/core/utils/formatTableDateTime"

type Props = {
  value: TableDateTimeInput
  /** Class for the time line. Defaults to compact muted subtext. */
  timeClassName?: string
  empty?: React.ReactNode
}

export const TableDateTime = ({
  value,
  timeClassName = "text-xs text-gray-500",
  empty = "—",
}: Props) => {
  const content = formatTableDateTime(value)
  if (!content) return empty

  return (
    <time dateTime={content.dateTime} className="block leading-tight tabular-nums">
      <span className="block whitespace-nowrap">{content.date}</span>
      <span className={twJoin(timeClassName, "block whitespace-nowrap")}>{content.time}</span>
    </time>
  )
}
