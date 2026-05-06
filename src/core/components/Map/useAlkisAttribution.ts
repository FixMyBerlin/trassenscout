"use client"

import { useTryProjectSlug } from "@/src/core/routes/useProjectSlug"
import {
  ALKIS_ATTRIBUTION_LICENSE_URL,
  type AlkisStateConfigEntry,
} from "@/src/server/alkis/alkisStateConfig.types"
import getAlkisAttributionByProject from "@/src/server/alkis/queries/getAlkisAttributionByProject"
import { useQuery } from "@blitzjs/rpc"

export function alkisAttributionToHtml(
  attribution: AlkisStateConfigEntry["attribution"] | null | undefined,
) {
  if (!attribution) return undefined
  const { text, url, license } = attribution
  const licenseUrl = ALKIS_ATTRIBUTION_LICENSE_URL[license]
  const provider = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
  const licenseLink = `<a href="${licenseUrl}" target="_blank" rel="noopener noreferrer">${license}</a>`
  return `${provider} · ${licenseLink}`
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
