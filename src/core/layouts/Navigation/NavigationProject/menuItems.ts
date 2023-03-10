import { Routes } from "@blitzjs/next"
import { Project, Section } from "@prisma/client"

export const menuItems = (projectSlug: Project["slug"], sections: Section[]) => {
  const sectionLinksChildren = sections?.map((section) => ({
    name: section.title,
    slug: section.slug,
    href: Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: section.slug }),
  }))

  const sectionLinks = Boolean(sectionLinksChildren.length)
    ? [
        {
          name: "Teilstrecken",
          href: sectionLinksChildren[0]!.href,
          children: sectionLinksChildren,
        },
      ]
    : []
  return [
    ...sectionLinks,
    { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
    { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
    { name: "Dokumente", href: Routes.FilesPage({ projectSlug: projectSlug! }) },
  ]
}
