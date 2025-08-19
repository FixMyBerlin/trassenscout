import { useTryProjectSlug } from "../../../../../core/routes/useProjectSlug"

function countSubstringOccurrences(str: string, substring: string) {
  if (substring === "") return 0 // Avoid infinite loop for empty substring
  return str.split(substring).length - 1
}

export const shouldHighlight = (item: ReturnType, checkPath: string | null) => {
  if (item.href === checkPath) return true

  return checkPath
    ? (item.alsoHighlightPaths || []).some((i) => {
        // `/[projectSlug]` would trigger for all cases, so we need to check for at least two `/`
        return countSubstringOccurrences(i, "/") >= 2 && checkPath.startsWith(i)
      })
    : false
}

type ReturnType = {
  name: string
  href: string // Route // TODO TS: It would be great if we could rely on the NextJS typed routes here, but this errors for unkown reasons
  alsoHighlightPaths?: string[]
}

export const useMenuItems = () => {
  const projectSlug = useTryProjectSlug()
  if (!projectSlug) return []

  const items: ReturnType[] = [
    {
      name: "Planungen",
      href: `/${projectSlug}`,
      alsoHighlightPaths: [`/${projectSlug}/abschnitte/`],
    },
    {
      name: "Protokoll",
      href: `/${projectSlug}/protocols`,
      alsoHighlightPaths: [`/${projectSlug}/protocols/`],
    },
    {
      name: "Dokumente",
      href: `/${projectSlug}/uploads`,
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
