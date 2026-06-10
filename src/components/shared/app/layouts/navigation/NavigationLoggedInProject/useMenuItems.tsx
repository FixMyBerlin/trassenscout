import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"

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
    {
      name: "Kontakte",
      href: `/${projectSlug}/contacts`,
      alsoHighlightPaths: [
        `/${projectSlug}/contacts/`,
        `/${projectSlug}/invites`,
        `/${projectSlug}/invites/`,
      ],
    },
    {
      name: "Beteiligung",
      href: `/${projectSlug}/surveys`,
      alsoHighlightPaths: [`/${projectSlug}/surveys`],
    },
  ]
  return items
}
