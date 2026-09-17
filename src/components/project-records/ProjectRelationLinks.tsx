import type { ReactNode } from "react"
import { Link } from "@/src/components/core/components/links/Link"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"

export type SubsubsectionRelation = {
  slug: string
  subsection: { slug: string }
}

export type AcquisitionAreaRelation = {
  id: number
  subsubsection: SubsubsectionRelation
  parcel: { alkisParcelId: string }
}

export type ProjectRecordRelation = {
  id: number
  title: string
  date?: Date | string | null
}

type RelationLinkProps = {
  className?: string
  children?: ReactNode
}

export function subsubsectionRelationKey(subsubsection: SubsubsectionRelation) {
  return `${subsubsection.subsection.slug}-${subsubsection.slug}`
}

export function acquisitionAreaRelationKey(acquisitionArea: AcquisitionAreaRelation) {
  return String(acquisitionArea.id)
}

export function projectRecordRelationKey(projectRecord: ProjectRecordRelation) {
  return String(projectRecord.id)
}

function formatSubsubsectionRelationLinkText(subsubsection: SubsubsectionRelation) {
  return shortTitle(subsubsection.slug)
}

export function formatSubsubsectionRelationOptionLabel(subsubsection: SubsubsectionRelation) {
  return `Maßnahme: ${shortTitle(subsubsection.slug)}`
}

export function formatAcquisitionAreaRelationLinkText(acquisitionArea: AcquisitionAreaRelation) {
  return `${acquisitionArea.id} (${acquisitionArea.parcel.alkisParcelId})`
}

export function formatAcquisitionAreaRelationOptionLabel(acquisitionArea: AcquisitionAreaRelation) {
  return `Verhandlungsfläche: ${acquisitionArea.id} - Flurstücknr. ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(
    acquisitionArea.subsubsection.slug,
  )})`
}

function formatProjectRecordRelationLinkText(
  projectRecord: ProjectRecordRelation,
  options: { withDate?: boolean } = {},
) {
  if (!options.withDate || !projectRecord.date) return projectRecord.title

  return `${projectRecord.title} (${formatBerlinTime(projectRecord.date, "dd.MM.yyyy")})`
}

export function SubsubsectionRelationLink({
  projectSlug,
  subsubsection,
  className,
  children,
}: RelationLinkProps & {
  projectSlug: string
  subsubsection: SubsubsectionRelation
}) {
  return (
    <Link
      to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
      params={{
        projectSlug,
        subsectionSlug: subsubsection.subsection.slug,
        subsubsectionSlug: subsubsection.slug,
      }}
      className={className}
    >
      {children ?? formatSubsubsectionRelationLinkText(subsubsection)}
    </Link>
  )
}

export function AcquisitionAreaRelationLink({
  projectSlug,
  acquisitionArea,
  className,
  children,
}: RelationLinkProps & {
  projectSlug: string
  acquisitionArea: AcquisitionAreaRelation
}) {
  return (
    <Link
      to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
      params={{
        projectSlug,
        subsectionSlug: acquisitionArea.subsubsection.subsection.slug,
        subsubsectionSlug: acquisitionArea.subsubsection.slug,
      }}
      search={{ acquisitionAreaId: String(acquisitionArea.id) }}
      className={className}
    >
      {children ?? formatAcquisitionAreaRelationLinkText(acquisitionArea)}
    </Link>
  )
}

export function ProjectRecordRelationLink({
  projectRecord,
  withDate,
  className,
  children,
}: RelationLinkProps & {
  projectRecord: ProjectRecordRelation
  withDate?: boolean
}) {
  const projectRecordModal = useProjectRecordModal()

  return (
    <Link
      to={projectRecordModal.getProjectRecordDetailHref({
        projectRecordId: projectRecord.id,
      })}
      resetScroll={false}
      className={className}
    >
      {children ?? formatProjectRecordRelationLinkText(projectRecord, { withDate })}
    </Link>
  )
}
