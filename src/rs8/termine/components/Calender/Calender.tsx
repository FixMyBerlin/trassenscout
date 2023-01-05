import { isAfter, startOfToday } from "date-fns"
import React from "react"
import { dates, TDate } from "src/fakeServer/rs8/dates.const"
import { DateList } from "./DateList"

type Props = {
  dates: TDate[]
}

export const Calender: React.FC<Props> = () => {
  const futureDates = dates
    .filter((date) => isAfter(new Date(date.start), startOfToday()))
    .sort((a, b) => {
      return isAfter(new Date(b.start), new Date(a.start)) ? 1 : -1
    })

  const pastDates = dates
    .filter((date) => !isAfter(new Date(date.start), startOfToday()))
    .sort((a, b) => {
      return isAfter(new Date(b.start), new Date(a.start)) ? 1 : -1
    })

  return (
    <section className="max-w-prose">
      <div className="mb-12">
        <h2 className="mb-2 text-3xl font-bold">Kommende Termine</h2>
        <DateList dates={futureDates} />
      </div>
      <div className="mb-12 pt-8">
        <h2 className="mb-2 text-3xl font-bold">Vergangene Termine</h2>
        <DateList dates={pastDates} />
      </div>
    </section>
  )
}
