import { Routes } from "@blitzjs/next"
import { Project, Section } from "@prisma/client"

export const menuItemsMobile = (projectSlug: Project["slug"] | undefined, sections: Section[]) => {
  if (!projectSlug) return []

  const sectionLinks = sections?.map((section) => ({
    name: section.title,
    href: Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: section.slug }),
  }))

  return [
    { name: "Dashboard", href: Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) },
    ...sectionLinks,
    { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
    { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
    { name: "Dokumente", href: Routes.FilesPage({ projectSlug: projectSlug! }) },
    { name: "Impressum", href: Routes.Kontakt() },
  ]
}

export const menuItemsDesktop = (projectSlug: Project["slug"] | undefined, sections: Section[]) => {
  if (!projectSlug) return []

  const sectionLinksChildren = sections?.map((section) => ({
    name: section.title,
    href: Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: section.slug }),
  }))

  const sectionLinks = Boolean(sectionLinksChildren.length) && {
    name: "Teilstrecken",
    href: sectionLinksChildren[0]!.href, // ! nötig damit "versichert" wird dass href property nie undefined sein wird (sonst type error)
    children: sectionLinksChildren,
  }

  if (!sectionLinks)
    return [
      { name: "Dashboard", href: Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) },
      { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
      { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
      { name: "Dokumente", href: Routes.FilesPage({ projectSlug: projectSlug! }) },
      { name: "Impressum", href: Routes.Kontakt() },
    ]

  return [
    { name: "Dashboard", href: Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) },
    sectionLinks,
    { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
    { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
    { name: "Dokumente", href: Routes.FilesPage({ projectSlug: projectSlug! }) },
    { name: "Impressum", href: Routes.Kontakt() },
  ]
}
