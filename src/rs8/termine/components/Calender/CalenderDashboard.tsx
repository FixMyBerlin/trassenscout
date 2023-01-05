import { isAfter, startOfToday } from "date-fns"
import { Link } from "src/core/components/links/Link"
import { dates } from "src/fakeServer/rs8/dates.const"
import { DateList } from "./DateList"

export const CalenderDashboard: React.FC = () => {
  const futureDates = dates
    .filter((date) => isAfter(new Date(date.start), startOfToday()))
    .sort((a, b) => {
      return isAfter(new Date(b.start), new Date(a.start)) ? 1 : -1
    })
  const displayDates = futureDates.slice(0, 3)

  return (
    <section className="my-12 space-y-6 md:max-w-prose">
      <h2 className="mb-2 text-3xl font-bold">Kommende Termine</h2>
      <DateList dates={displayDates} />
      <Link button href="/rs8/termine">
        {futureDates.length > 3 ? (
          <>Weitere {futureDates.length - 3} Termine anzeigen</>
        ) : (
          "Alle Termine"
        )}
      </Link>
    </section>
  )
}
