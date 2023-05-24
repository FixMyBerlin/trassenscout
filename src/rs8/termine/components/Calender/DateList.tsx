import { CalendarEntry } from "@prisma/client"
import React from "react"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { DateEntry } from "./DateEntry"

type Props = {
  calendarEntries: CalendarEntry[]
}

export const DateList: React.FC<Props> = ({ calendarEntries }) => {
  if (!calendarEntries.length) {
    return <ZeroCase visible={calendarEntries.length} name="Termine" />
  }

  return (
    <ul className="overflow-clip rounded-lg border border-x-2 border-gray-100 shadow-md">
      {calendarEntries.map((calendarEntry) => {
        return (
          <li key={calendarEntry.id} className="border-t-2 border-gray-100 first:border-t-0">
            <DateEntry calendarEntry={calendarEntry} />
          </li>
        )
      })}
    </ul>
  )
}
