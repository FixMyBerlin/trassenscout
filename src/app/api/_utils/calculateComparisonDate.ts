import { endOfDay, subDays } from "date-fns"

export const calculateComparisonDate = (daysToComparison: number) => {
  const currentDate = endOfDay(new Date())
  // Calculate the date that is INVITE_DAYS_TO_DELETION days before the current date
  return subDays(currentDate, daysToComparison)
}
