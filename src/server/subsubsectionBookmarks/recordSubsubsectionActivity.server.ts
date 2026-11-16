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
