"use client"

import { useTryProjectSlug } from "@/src/core/routes/useProjectSlug"
import type { AlkisStateConfigEntry } from "@/src/server/alkis/alkisStateConfig"
import getAlkisAttributionByProject from "@/src/server/alkis/queries/getAlkisAttributionByProject"
import { useQuery } from "@blitzjs/rpc"

export function alkisAttributionToHtml(
  attribution: AlkisStateConfigEntry["attribution"] | null | undefined,
) {
  if (!attribution) return undefined
  const { text, url, license } = attribution
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
}

export function useAlkisAttribution() {
  const projectSlug = useTryProjectSlug()
  const [attribution] = useQuery(
    getAlkisAttributionByProject,
    { projectSlug: projectSlug ?? "" },
    {
      enabled: Boolean(projectSlug),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  return attribution
}
