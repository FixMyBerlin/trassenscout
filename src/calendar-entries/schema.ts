import { z } from "zod"

export const CalendarEntrySchema = z.object({
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  startAt: z.coerce.date({
    // TODO `coerce` makes it, that the error messages on date() don't show becaue zod returns the error given by `new Date(input)`.
    required_error: "Datum ist erforderlich.",
    invalid_type_error: "Kein gültiges Datumsformat.",
  }),
  locationName: z.string().nullish(),
  // Either emtpy, or url (https://github.com/colinhacks/zod/issues/798#issuecomment-990891815)
  locationUrl: z.union([
    z.undefined(),
    z.null(),
    z.literal(""),
    z.string().url({ message: "Kein gültige URL." }),
  ]),
  description: z.string().nullish(),
})
