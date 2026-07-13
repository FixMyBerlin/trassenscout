import db from "@/src/server/db.server"

export async function getTagUsageCount(projectSlug: string, tagId: number) {
  const [projectRecords, templates, uploads, contacts] = await Promise.all([
    db.projectRecord.count({
      where: { tags: { some: { id: tagId } }, project: { slug: projectSlug } },
    }),
    db.projectRecordTemplate.count({
      where: { tags: { some: { id: tagId } }, projects: { some: { slug: projectSlug } } },
    }),
    db.upload.count({
      where: { tags: { some: { id: tagId } }, project: { slug: projectSlug } },
    }),
    db.contact.count({
      where: { tags: { some: { id: tagId } }, project: { slug: projectSlug } },
    }),
  ])

  return projectRecords + templates + uploads + contacts
}
