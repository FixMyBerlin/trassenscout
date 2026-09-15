import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import {
  AcquisitionAreaRelationLink,
  acquisitionAreaRelationKey,
  type AcquisitionAreaRelation,
  ProjectRecordRelationLink,
  projectRecordRelationKey,
  type ProjectRecordRelation,
  SubsubsectionRelationLink,
  subsubsectionRelationKey,
  type SubsubsectionRelation,
} from "@/src/components/project-records/ProjectRelationLinks"
import {
  uploadAlignedLabelClassName,
  uploadAlignedRowClassName,
  uploadAlignedValueClassName,
} from "@/src/components/uploads/uploadAlignedFieldStyles"

type Props = {
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  subsubsections: SubsubsectionRelation[]
  acquisitionAreas: AcquisitionAreaRelation[]
  projectRecords: ProjectRecordRelation[] | null
  projectRecordEmail: { createdAt: Date } | null
  surveyResponse: { id: number; surveySession: { survey: { id: number; slug: string } } } | null
  tags?: { id: number; title: string }[]
  className?: string
  variant?: "default" | "aligned"
}

export const UploadVerknuepfungen = ({
  projectSlug,
  landAcquisitionModuleEnabled,
  subsubsections,
  acquisitionAreas,
  projectRecords,
  projectRecordEmail,
  surveyResponse,
  tags = [],
  className,
  variant = "default",
}: Props) => {
  const hasSubsubsection = subsubsections?.length > 0
  const hasProjectRecords = projectRecords != null && projectRecords.length > 0
  const hasAcquisitionAreas = landAcquisitionModuleEnabled && acquisitionAreas.length > 0
  const hasProjectRecordEmail = projectRecordEmail !== null
  const hasSurveyResponse = surveyResponse !== null
  const hasTags = tags.length > 0
  const hasRelations =
    hasSubsubsection ||
    hasAcquisitionAreas ||
    hasProjectRecords ||
    hasProjectRecordEmail ||
    hasSurveyResponse ||
    hasTags

  const sortedAcquisitionAreas = hasAcquisitionAreas
    ? [...acquisitionAreas].sort((a, b) => {
        const subCompare = a.subsubsection.subsection.slug.localeCompare(
          b.subsubsection.subsection.slug,
        )
        if (subCompare !== 0) return subCompare
        const ssCompare = a.subsubsection.slug.localeCompare(b.subsubsection.slug)
        if (ssCompare !== 0) return ssCompare
        return a.id - b.id
      })
    : []

  if (variant === "aligned") {
    if (!hasRelations) {
      return <p className="text-sm text-gray-500">Keine Verknüpfung</p>
    }

    return (
      <section className={className}>
        {hasSubsubsection && (
          <div className={uploadAlignedRowClassName}>
            <p className={uploadAlignedLabelClassName}>
              {subsubsections.length === 1 ? "Maßnahme:" : "Maßnahmen:"}
            </p>
            <div className={`space-y-1 ${uploadAlignedValueClassName}`}>
              {subsubsections.map((subsub) => (
                <SubsubsectionRelationLink
                  key={subsubsectionRelationKey(subsub)}
                  projectSlug={projectSlug}
                  subsubsection={subsub}
                  className="block w-fit"
                />
              ))}
            </div>
          </div>
        )}

        {hasAcquisitionAreas && (
          <div className={uploadAlignedRowClassName}>
            <p className={uploadAlignedLabelClassName}>
              {sortedAcquisitionAreas.length === 1 ? "Verhandlungsfläche:" : "Verhandlungsflächen:"}
            </p>
            <div className={`space-y-1 ${uploadAlignedValueClassName}`}>
              {sortedAcquisitionAreas.map((area) => (
                <AcquisitionAreaRelationLink
                  key={acquisitionAreaRelationKey(area)}
                  projectSlug={projectSlug}
                  acquisitionArea={area}
                  className="block w-fit"
                />
              ))}
            </div>
          </div>
        )}

        {hasSurveyResponse && (
          <div className={uploadAlignedRowClassName}>
            <p className={uploadAlignedLabelClassName}>Beteiligung:</p>
            <div className={uploadAlignedValueClassName}>
              <Link
                to={`/${projectSlug}/surveys/${surveyResponse.surveySession.survey.id}/responses?responseDetails=${surveyResponse.id}`}
              >
                Beitrag mit der ID {surveyResponse.id} - Formular{" "}
                {surveyResponse.surveySession.survey.slug}
              </Link>
            </div>
          </div>
        )}

        {hasProjectRecordEmail && (
          <div className={uploadAlignedRowClassName}>
            <p className={uploadAlignedLabelClassName}>E-Mail-Anhang:</p>
            <span className={uploadAlignedValueClassName}>
              {formatBerlinTime(projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
            </span>
          </div>
        )}

        {hasTags && (
          <div className={twJoin(uploadAlignedRowClassName, "mt-1")}>
            <p className={uploadAlignedLabelClassName}>{tags.length === 1 ? "Tag:" : "Tags:"}</p>
            <div className={uploadAlignedValueClassName}>
              <ProjectRecordTagsList tags={tags} />
            </div>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className={className}>
      {hasRelations ? (
        <ul className="mt-1.5 list-none space-y-0.5 text-sm">
          {hasSubsubsection &&
            (subsubsections.length === 1 ? (
              <li key={subsubsectionRelationKey(subsubsections[0]!)}>
                <strong className="font-medium">Maßnahme: </strong>
                <SubsubsectionRelationLink
                  projectSlug={projectSlug}
                  subsubsection={subsubsections[0]!}
                />
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-1">
                <strong className="font-medium">Maßnahmen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {subsubsections.map((subsub, index) => (
                    <li key={subsubsectionRelationKey(subsub)} className="inline-flex">
                      <SubsubsectionRelationLink projectSlug={projectSlug} subsubsection={subsub} />
                      {index < subsubsections.length - 1 ? <span>,</span> : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {hasAcquisitionAreas &&
            (sortedAcquisitionAreas.length === 1 ? (
              <li key={acquisitionAreaRelationKey(sortedAcquisitionAreas[0]!)}>
                <strong className="font-medium">Verhandlungsfläche: </strong>
                <AcquisitionAreaRelationLink
                  projectSlug={projectSlug}
                  acquisitionArea={sortedAcquisitionAreas[0]!}
                />
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-1">
                <strong className="font-medium">Verhandlungsflächen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {sortedAcquisitionAreas.map((area, index) => (
                    <li key={acquisitionAreaRelationKey(area)} className="inline-flex">
                      <AcquisitionAreaRelationLink
                        projectSlug={projectSlug}
                        acquisitionArea={area}
                      />
                      {index < sortedAcquisitionAreas.length - 1 ? <span>,</span> : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {hasProjectRecords && (
            <li>
              {projectRecords!.length === 1 ? (
                <>
                  <strong className="font-medium">Protokolleintrag: </strong>
                  <ProjectRecordRelationLink projectRecord={projectRecords![0]!} />
                </>
              ) : (
                <>
                  <strong className="font-medium">Protokolleinträge: </strong>
                  <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                    {projectRecords!.map((record, index) => (
                      <li key={projectRecordRelationKey(record)} className="inline-flex">
                        <ProjectRecordRelationLink projectRecord={record} />
                        {index < projectRecords!.length - 1 ? <span>,</span> : null}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          )}
          {hasSurveyResponse && (
            <li>
              <strong className="font-medium">Beteiligung: </strong>
              <Link
                to={`/${projectSlug}/surveys/${surveyResponse.surveySession.survey.id}/responses?responseDetails=${surveyResponse.id}`}
              >
                Eingabe mit der ID {surveyResponse.id} - Formular{" "}
                {surveyResponse.surveySession.survey.slug}
              </Link>
            </li>
          )}
          {hasProjectRecordEmail && (
            <li>
              <strong className="font-medium">E-Mail-Anhang: </strong>
              {formatBerlinTime(projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
            </li>
          )}
          {hasTags && (
            <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <strong className="font-medium">{tags.length === 1 ? "Tag: " : "Tags: "}</strong>
              <ProjectRecordTagsList tags={tags} />
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-1.5 text-sm">Dieses Dokument hat keine Verknüpfungen.</p>
      )}
    </section>
  )
}
