import { H2 } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { CalendarEntry } from "@prisma/client"
import { isAfter, startOfToday } from "date-fns"
import { DateList } from "./DateList"

type Props = {
  calendarEntries: CalendarEntry[]
}

export const Calender: React.FC<Props> = ({ calendarEntries }) => {
  const futureCalendarEntries = calendarEntries
    .filter((date) => isAfter(new Date(date.startAt), startOfToday()))
    .sort((a, b) => {
      return isAfter(new Date(b.startAt), new Date(a.startAt)) ? 1 : -1
    })

  const pastCalendarEntries = calendarEntries
    .filter((date) => !isAfter(new Date(date.startAt), startOfToday()))
    .sort((a, b) => {
      return isAfter(new Date(b.startAt), new Date(a.startAt)) ? 1 : -1
    })

  // TODO why does suspense boundary not catch this?

  if (!calendarEntries.length) {
    return <ZeroCase visible={calendarEntries.length} name="Termine" />
  }

  return (
    <>
      <H2 className="mb-2">Kommende Termine</H2>
      <DateList calendarEntries={futureCalendarEntries} />

      <H2 className="mb-2 mt-12">Vergangene Termine</H2>
      <DateList calendarEntries={pastCalendarEntries} />
    </>
  )
}
