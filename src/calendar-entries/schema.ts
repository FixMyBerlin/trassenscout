import { z } from "zod"

export const CalendarEntrySchema = z.object({
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  startAt: z.coerce.date({
    // TODO `coerce` makes it, that the error messages on date() don't show becaue zod returns the error given by `new Date(input)`.
    required_error: "Datum ist erforderlich.",
    invalid_type_error: "Kein gültiges Datumsformat.",
  }),
  locationName: z.string().nullish(),
  // Either emtpy, or url (https://github.com/colinhacks/zod/pull/1849)
  locationUrl: z.union([z.string().url({ message: "Kein gültige URL." }).nullish(), z.literal("")]),
  description: z.string().nullish(),
})
