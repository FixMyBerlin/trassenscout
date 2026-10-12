import { useQuery } from "@tanstack/react-query"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

function countSubstringOccurrences(str: string, substring: string) {
  if (substring === "") return 0
  return str.split(substring).length - 1
}

export const shouldHighlight = (item: ReturnType, checkPath: string | null) => {
  if (item.href === checkPath) return true

  return checkPath
    ? (item.alsoHighlightPaths || []).some((i) => {
        return countSubstringOccurrences(i, "/") >= 2 && checkPath.startsWith(i)
      })
    : false
}

type ReturnType = {
  name: string
  href: string
  alsoHighlightPaths?: string[]
}

export const useMenuItems = () => {
  const projectSlug = useTryRouteParam("projectSlug")
  const { data: project } = useQuery({
    ...projectBySlugQueryOptions(projectSlug ?? ""),
    enabled: !!projectSlug,
  })
  const userCan = useUserCan()

  if (!projectSlug) return []

  const items: ReturnType[] = [
    {
      name: "Planungen",
      href: `/${projectSlug}`,
      alsoHighlightPaths: [`/${projectSlug}/abschnitte/`],
    },
    {
      name: "Protokoll",
      href: `/${projectSlug}/project-records`,
      alsoHighlightPaths: [`/${projectSlug}/project-records/`],
    },
    {
      name: "Dokumente",
      href: `/${projectSlug}/uploads`,
      alsoHighlightPaths: [`/${projectSlug}/uploads/`],
    },
    ...(project?.externalShareEnabled && userCan.edit
      ? [{ name: "Externe Freigabe", href: `/${projectSlug}/external-share` }]
      : []),
    {
      name: "Kontakte",
      href: `/${projectSlug}/contacts/team`,
      alsoHighlightPaths: [
        `/${projectSlug}/contacts`,
        `/${projectSlug}/contacts/`,
        `/${projectSlug}/invites`,
        `/${projectSlug}/invites/`,
      ],
    },
    {
      name: "Eingaben",
      href: `/${projectSlug}/surveys`,
      alsoHighlightPaths: [`/${projectSlug}/surveys`],
    },
  ]

  if (project?.evaluationsEnabled) {
    items.push({
      name: "Auswertungen",
      href: `/${projectSlug}/evaluations`,
    })
  }

  return items
}
