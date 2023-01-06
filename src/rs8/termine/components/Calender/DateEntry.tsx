import { ComputerDesktopIcon } from "@heroicons/react/24/outline"
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import React from "react"
import { TDate } from "src/fakeServer/rs8/dates.const"
import { Disclosure } from "../Disclosure"
import { Link, linkStyles } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { CalendarEntry } from "@prisma/client"

type Props = {
  calendarEntry: CalendarEntry
}

export const DateEntry: React.FC<Props> = ({ calendarEntry }) => {
  const locationDomain = calendarEntry.locationUrl && new URL(calendarEntry.locationUrl).hostname

  return (
    <Disclosure
      classNameButton="py-4 px-6 text-left text-sm text-gray-900"
      classNamePanel="px-6 pb-3"
      button={
        <div className="flex-auto">
          <h3 className={clsx("pr-10 font-semibold group-hover:underline md:pr-0", linkStyles)}>
            {calendarEntry.title}
          </h3>
          <dl className="mt-2 flex w-full flex-row justify-between">
            {/* Date / Location / Arrow Container */}
            <div className="flex flex-col justify-start md:flex-row md:items-center md:space-x-8">
              {/* Date / Location Container */}
              <div className="flex items-start space-x-3">
                <dt className="">
                  <span className="sr-only">Termin</span>
                  <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                </dt>
                <dd>
                  <time className="text-gray-500" dateTime={calendarEntry.startAt.toISOString()}>
                    {new Date(calendarEntry.startAt).toLocaleDateString()}
                  </time>
                </dd>
                <dd>
                  <time className="text-gray-500" dateTime={calendarEntry.startAt.toISOString()}>
                    {new Date(calendarEntry.startAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </dd>
              </div>
              <div className="flex items-start space-x-3">
                {calendarEntry.locationUrl && (
                  <>
                    <dt>
                      <span className="sr-only">Online-Konferenz-URL</span>{" "}
                      <ComputerDesktopIcon className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="text-gray-500">
                      <Link blank href={calendarEntry.locationUrl}>
                        {locationDomain}
                      </Link>
                    </dd>
                  </>
                )}
                {calendarEntry.locationName && (
                  <>
                    <dt>
                      <span className="sr-only">Treffpunkt</span>{" "}
                      <MapPinIcon className="h-5 w-5 text-gray-500" />
                    </dt>
                    <dd className="text-gray-500">{calendarEntry.locationName}</dd>
                  </>
                )}
              </div>
            </div>
          </dl>
        </div>
      }
    >
      {!calendarEntry.description ? (
        <p className="text-gray-300">Für diesen Termin liegen keine Details vor.</p>
      ) : (
        <Markdown className="prose-sm" markdown={calendarEntry.description} />
      )}
    </Disclosure>
  )
}
