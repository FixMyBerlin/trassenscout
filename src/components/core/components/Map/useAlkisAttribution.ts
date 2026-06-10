import { useQuery } from "@tanstack/react-query"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { getAlkisAttributionByProjectFn } from "@/src/server/alkis/alkis.functions"
import {
  ALKIS_ATTRIBUTION_LICENSE_URL,
  type AlkisStateConfigEntry,
} from "@/src/server/alkis/alkisStateConfig.types"

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
  const projectSlug = useTryRouteParam("projectSlug")
  const { data: attribution } = useQuery({
    queryKey: ["alkisAttribution", projectSlug],
    queryFn: () => getAlkisAttributionByProjectFn({ data: { projectSlug: projectSlug! } }),
    enabled: Boolean(projectSlug),
  })
  return attribution
}
