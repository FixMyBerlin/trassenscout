import { Routes } from "@blitzjs/next"
import { Project, Section } from "@prisma/client"
import { MenuItem } from "../types"

export const menuItems = (projectSlug: Project["slug"]) => {
  return [
    {
      name: "Kontakte",
      href: Routes.ContactsPage({ projectSlug: projectSlug! }),
      alsoHighlightPathnames: [Routes.ProjectTeamPage({ projectSlug: projectSlug! }).pathname],
    },
    { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
    { name: "Dokumente", href: Routes.FilesPage({ projectSlug: projectSlug! }) },
  ]
}
