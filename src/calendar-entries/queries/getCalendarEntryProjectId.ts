import db from "@/db"

const getCalendarEntryProjectId = async (input: Record<string, any>) =>
  (
    await db.calendarEntry.findFirstOrThrow({
      where: { id: input.id || null },
      select: { projectId: true },
    })
  ).projectId

export default getCalendarEntryProjectId
