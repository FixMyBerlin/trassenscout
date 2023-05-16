import { CalendarEntry } from "@prisma/client"
import { isAfter, startOfToday } from "date-fns"
import React from "react"
import { DateList } from "./DateList"
import { H2 } from "src/core/components/text"

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
    return (
      <p className="text-center text-xl text-gray-500">
        <span>Es wurden noch keine Termine eingetragen.</span>
      </p>
    )
  }

  return (
    <>
      <H2 className="mb-2">Kommende Termine</H2>
      <DateList calendarEntries={futureCalendarEntries} />

      <H2 className="mt-12 mb-2">Vergangene Termine</H2>
      <DateList calendarEntries={pastCalendarEntries} />
    </>
  )
}
