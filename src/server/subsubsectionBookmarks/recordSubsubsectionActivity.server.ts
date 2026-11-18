import db from "@/src/server/db.server"

function uniqueIds(ids: Array<number | null | undefined>) {
  return [...new Set(ids.filter((id): id is number => id != null))]
}

/**
 * Marks the Maßnahmen as updated by the user ("zuletzt bearbeitet") and bookmarks them for that user.
 */
export async function recordSubsubsectionActivity({
  subsubsectionIds,
  userId,
}: {
  subsubsectionIds: number[]
  userId: number
}) {
  const ids = uniqueIds(subsubsectionIds)
  if (ids.length === 0) return

  await db.subsubsection.updateMany({
    where: { id: { in: ids } },
    data: { updatedById: userId },
  })
  await db.subsubsectionBookmark.createMany({
    data: ids.map((subsubsectionId) => ({ userId, subsubsectionId })),
    skipDuplicates: true,
  })
}

/** Only creates missing bookmarks. Does not change "zuletzt bearbeitet". */
export async function addSubsubsectionBookmarks({
  subsubsectionIds,
  userIds,
}: {
  subsubsectionIds: number[]
  userIds: Array<number | null | undefined>
}) {
  const ids = uniqueIds(subsubsectionIds)
  const users = uniqueIds(userIds)
  if (ids.length === 0 || users.length === 0) return

  await db.subsubsectionBookmark.createMany({
    data: users.flatMap((userId) => ids.map((subsubsectionId) => ({ userId, subsubsectionId }))),
    skipDuplicates: true,
  })
}

/**
 * Work inside a Protokoll (Anmerkung, Dokument) bookmarks its Maßnahmen for the acting user,
 * like an assignment. The Maßnahme itself is unchanged, so "zuletzt bearbeitet" stays.
 */
export async function bookmarkProjectRecordSubsubsections({
  projectRecordIds,
  userId,
}: {
  projectRecordIds: number[]
  userId: number
}) {
  const ids = uniqueIds(projectRecordIds)
  if (ids.length === 0) return

  const records = await db.projectRecord.findMany({
    where: { id: { in: ids } },
    select: { subsubsectionId: true, subsubsections: { select: { id: true } } },
  })
  await addSubsubsectionBookmarks({
    subsubsectionIds: records.flatMap((record) => [
      ...(record.subsubsectionId == null ? [] : [record.subsubsectionId]),
      ...record.subsubsections.map(({ id }) => id),
    ]),
    userIds: [userId],
  })
}
