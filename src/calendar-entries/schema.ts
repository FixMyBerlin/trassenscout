import { z } from "zod"

export const CalendarEntrySchema = z.object({
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  startAt: z.coerce.date({
    // `coerce` makes it that we need to work around a nontranslatable error
    // Thanks to https://github.com/colinhacks/zod/discussions/1851#discussioncomment-4649675
    errorMap: ({ code }, { defaultError }) => {
      if (code == "invalid_date")
        return { message: "Pflichfeld. Das Datum ist nicht richtig formatiert." }
      return { message: defaultError }
    },
  }),
  locationName: z.string().nullish(),
  // Either emtpy, or url (https://github.com/colinhacks/zod/pull/1849)
  locationUrl: z.union([
    z.string().url({ message: "Die URL ist ungültig." }).nullish(),
    z.literal(""),
  ]),
  description: z.string().nullish(),
  projectId: z.coerce.number(),
})

export const CalendarEntryStartDateStartTimeSchema = z.object({
  startDate: z.string().min(8, { message: "Pflichtfeld." }),
  startTime: z.string().min(5, { message: "Pflichtfeld." }),
})
