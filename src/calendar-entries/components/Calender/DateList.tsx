import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { CalendarEntry } from "@prisma/client"
import { DateEntry } from "./DateEntry"

type Props = {
  calendarEntries: CalendarEntry[]
}

export const DateList: React.FC<Props> = ({ calendarEntries }) => {
  if (!calendarEntries.length) {
    return <ZeroCase visible={calendarEntries.length} name="Termine" />
  }

  return (
    <ul className="overflow-clip rounded-lg border border-x-2 border-gray-100">
      {calendarEntries.map((calendarEntry) => {
        return (
          <li key={calendarEntry.id}>
            <DateEntry calendarEntry={calendarEntry} />
          </li>
        )
      })}
    </ul>
  )
}
