import { Link } from "@/src/components/core/components/links/Link"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import type { LogEntryTarget } from "@/src/server/logEntries/logEntryTarget"
import type { LogEntryRow } from "@/src/server/logEntries/types"

type BuildModalHref = ReturnType<typeof useProjectModalNavigation>["buildModalHref"]

function modalSearch(target: LogEntryTarget) {
  switch (target.type) {
    case "projectRecord":
      return {
        page: "project-records",
        search: {
          modalProjectRecordId: target.projectRecordId,
          modalProjectRecordView: "detail" as const,
        },
      }
    case "upload":
      return {
        page: "uploads",
        search: { modalUploadId: target.uploadId, modalUploadView: "detail" as const },
      }
    case "contact":
      return {
        page: "contacts",
        search: { modalContactId: target.contactId, modalContactView: "detail" as const },
      }
    case "acquisitionArea":
    case "surveyResponse":
    case "subsubsection":
    case "subsection":
      return null
  }
}

function pageHref(projectSlug: string, target: LogEntryTarget) {
  switch (target.type) {
    case "acquisitionArea":
      return `/${projectSlug}/abschnitte/${target.subsectionSlug}/fuehrung/${target.subsubsectionSlug}/land-acquisition?acquisitionAreaId=${target.acquisitionAreaId}`
    case "surveyResponse":
      return `/${projectSlug}/surveys/${target.surveyId}/responses?responseDetails=${target.surveyResponseId}`
    case "subsubsection":
      return `/${projectSlug}/abschnitte/${target.subsectionSlug}/fuehrung/${target.subsubsectionSlug}?view=map`
    case "subsection":
      return `/${projectSlug}/abschnitte/${target.subsectionSlug}?view=map`
    case "projectRecord":
    case "upload":
    case "contact":
      return null
  }
}

function targetHref({
  projectSlug,
  target,
  buildModalHref,
  routeProjectSlug,
}: {
  projectSlug: string
  target: LogEntryTarget
  buildModalHref: BuildModalHref | null
  routeProjectSlug: string | undefined
}) {
  const modal = modalSearch(target)
  if (!modal) return pageHref(projectSlug, target)

  if (buildModalHref) {
    return buildModalHref({
      ...modal.search,
      modalProjectSlug: routeProjectSlug ? undefined : projectSlug,
    })
  }

  const query = new URLSearchParams(
    Object.entries(modal.search).map(([key, value]) => [key, String(value)]),
  )
  return `/${projectSlug}/${modal.page}?${query}`
}

export function LogEntryMessage({
  entry,
  buildModalHref,
}: {
  entry: LogEntryRow
  buildModalHref: BuildModalHref | null
}) {
  const routeProjectSlug = useTryRouteParam("projectSlug")
  const message = entry.message ?? ""
  if (!entry.target || !entry.projectSlug || !message) return <>{message}</>

  const href = targetHref({
    projectSlug: entry.projectSlug,
    target: entry.target,
    buildModalHref,
    routeProjectSlug,
  })
  if (!href) return <>{message}</>

  const opensModal = buildModalHref !== null && modalSearch(entry.target) !== null

  return (
    <Link
      to={href}
      resetScroll={opensModal ? false : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      {message}
    </Link>
  )
}

/** On pages without a `ProjectModalHost` (admin) links go to the project page instead. */
export function useLogEntryModalHref(modalsInPlace: boolean) {
  const { buildModalHref } = useProjectModalNavigation()
  return modalsInPlace ? buildModalHref : null
}
