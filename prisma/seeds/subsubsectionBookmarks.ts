import db from "@/src/server/db.server"

const seedSubsubsectionBookmarks = async () => {
  const user = await db.user.findUniqueOrThrow({
    where: { email: "all-projects-editor@fixmycity.test" },
  })
  const subsubsection = await db.subsubsection.findFirstOrThrow({
    where: { slug: "line-1", subsection: { slug: "poly-3", project: { slug: "rs23" } } },
  })

  await db.subsubsectionBookmark.upsert({
    where: { userId_subsubsectionId: { userId: user.id, subsubsectionId: subsubsection.id } },
    update: {},
    create: { userId: user.id, subsubsectionId: subsubsection.id },
  })
}

export default seedSubsubsectionBookmarks
