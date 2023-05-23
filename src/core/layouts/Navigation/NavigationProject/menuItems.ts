import { Routes } from "@blitzjs/next"
import { Project } from "@prisma/client"

export const menuItems = (projectSlug: Project["slug"]) => {
  return [
    { name: "Dashboard", href: Routes.ProjectDashboardPage({ projectSlug: projectSlug! }) },
    {
      name: "Kontakte",
      href: Routes.ContactsPage({ projectSlug: projectSlug! }),
      alsoHighlightPathnames: [Routes.ProjectTeamPage({ projectSlug: projectSlug! }).pathname],
    },
    { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
    { name: "Dokumente", href: Routes.FilesPage({ projectSlug: projectSlug! }) },
  ]
}
