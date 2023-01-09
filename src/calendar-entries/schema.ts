import { z } from "zod"

export const CalendarEntrySchema = z.object({
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  startAt: z.string().datetime({ message: "Kein gültiges Datumsformat." }),
  locationName: z.string().nullish(),
  locationUrl: z.string().url({ message: "Kein gültige URL." }).nullish(),
  description: z.string().nullish(),
})

export type CalendarEntryType = z.infer<typeof CalendarEntrySchema>
