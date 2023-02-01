import { CalendarEntrySchema } from "../schema"

// We cannot use the datetime-local field because that is broken in Firefox
// (even though it is green on caniuse.com; but the bug is reported in Firefox)
// We work around this by splitting fields in two and then merging the date again here.
export const transformValuesWithStartAt = (inputValues: any) => {
  const valuesCopy = structuredClone(inputValues) // not sure if this is needed

  // Build and set the startAt based on the separate Daten + Time input
  valuesCopy.startAt = new Date(`${inputValues.startDate}T${inputValues.startTime}`)

  // This is just to catch cases where the date input is malformed (eg. input "date" falls back to type "text")
  CalendarEntrySchema.pick({ startAt: true }).parse({ startAt: valuesCopy.startAt })

  delete inputValues.startDate
  delete inputValues.startTime

  return valuesCopy
}
