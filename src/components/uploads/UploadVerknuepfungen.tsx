import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"

type AcquisitionAreaLink = {
  id: number
  subsubsection: {
    slug: string
    subsection: { slug: string }
  }
  parcel: { alkisParcelId: string }
}

type Props = {
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  subsubsections: { slug: string; subsection: { slug: string } }[]
  acquisitionAreas: AcquisitionAreaLink[]
  projectRecords: { id: number; title: string; date: Date | null }[] | null
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
  const projectRecordModal = useProjectRecordModal()
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
    const sectionClassName =
      "grid gap-2 sm:grid-cols-[minmax(170px,_190px)_1fr] sm:items-start sm:gap-x-1 sm:gap-y-4"
    const sectionLabelClassName = "text-sm font-medium text-gray-700"
    const sectionValueClassName = "text-sm text-gray-700"

    if (!hasRelations) {
      return <p className="text-sm text-gray-500">Keine Verknüpfung</p>
    }

    return (
      <section className={className}>
        {hasSubsubsection && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>
              {subsubsections.length === 1 ? "Maßnahme:" : "Maßnahmen:"}
            </p>
            <div className={`space-y-1 ${sectionValueClassName}`}>
              {subsubsections.map((subsub) => (
                <Link
                  key={`${subsub.subsection.slug}-${subsub.slug}`}
                  to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                  params={{
                    projectSlug,
                    subsectionSlug: subsub.subsection.slug,
                    subsubsectionSlug: subsub.slug,
                  }}
                  className="block w-fit"
                >
                  {shortTitle(subsub.slug)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasAcquisitionAreas && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>
              {sortedAcquisitionAreas.length === 1 ? "Verhandlungsfläche:" : "Verhandlungsflächen:"}
            </p>
            <div className={`space-y-1 ${sectionValueClassName}`}>
              {sortedAcquisitionAreas.map((area) => (
                <Link
                  key={area.id}
                  to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                  params={{
                    projectSlug,
                    subsectionSlug: area.subsubsection.subsection.slug,
                    subsubsectionSlug: area.subsubsection.slug,
                  }}
                  search={{ acquisitionAreaId: String(area.id) }}
                  className="block w-fit"
                >
                  {area.id} ({area.parcel.alkisParcelId})
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasSurveyResponse && (
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>Beteiligung:</p>
            <div className={sectionValueClassName}>
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
          <div className={sectionClassName}>
            <p className={sectionLabelClassName}>E-Mail-Anhang:</p>
            <span className={sectionValueClassName}>
              {formatBerlinTime(projectRecordEmail!.createdAt, "dd.MM.yyyy, HH:mm")}
            </span>
          </div>
        )}

        {hasTags && (
          <div className={twJoin(sectionClassName, "mt-1")}>
            <p className={sectionLabelClassName}>{tags.length === 1 ? "Tag:" : "Tags:"}</p>
            <div className={sectionValueClassName}>
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
              <li key={`${subsubsections[0]!.subsection.slug}-${subsubsections[0]!.slug}`}>
                <strong className="font-medium">Maßnahme : </strong>
                <Link
                  to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                  params={{
                    projectSlug,
                    subsectionSlug: subsubsections[0]!.subsection.slug,
                    subsubsectionSlug: subsubsections[0]!.slug,
                  }}
                >
                  {shortTitle(subsubsections[0]!.slug)}
                </Link>
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-2">
                <strong className="font-medium">Maßnahmen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {subsubsections.map((subsub) => (
                    <li key={`${subsub.subsection.slug}-${subsub.slug}`}>
                      <Link
                        to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                        params={{
                          projectSlug,
                          subsectionSlug: subsub.subsection.slug,
                          subsubsectionSlug: subsub.slug,
                        }}
                      >
                        {shortTitle(subsub.slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {hasAcquisitionAreas &&
            (sortedAcquisitionAreas.length === 1 ? (
              <li key={sortedAcquisitionAreas[0]!.id}>
                <strong className="font-medium">Verhandlungsfläche: </strong>
                <Link
                  to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                  params={{
                    projectSlug,
                    subsectionSlug: sortedAcquisitionAreas[0]!.subsubsection.subsection.slug,
                    subsubsectionSlug: sortedAcquisitionAreas[0]!.subsubsection.slug,
                  }}
                  search={{ acquisitionAreaId: String(sortedAcquisitionAreas[0]!.id) }}
                >
                  {sortedAcquisitionAreas[0]!.id} ({sortedAcquisitionAreas[0]!.parcel.alkisParcelId}
                  )
                </Link>
              </li>
            ) : (
              <li className="flex flex-wrap items-baseline gap-x-2">
                <strong className="font-medium">Verhandlungsflächen: </strong>
                <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                  {sortedAcquisitionAreas.map((area) => (
                    <li key={area.id}>
                      <Link
                        to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                        params={{
                          projectSlug,
                          subsectionSlug: area.subsubsection.subsection.slug,
                          subsubsectionSlug: area.subsubsection.slug,
                        }}
                        search={{ acquisitionAreaId: String(area.id) }}
                      >
                        {area.id} ({area.parcel.alkisParcelId})
                      </Link>
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
                  <Link
                    to={projectRecordModal.getProjectRecordDetailHref({
                      projectRecordId: projectRecords![0]!.id,
                    })}
                    resetScroll={false}
                  >
                    {projectRecords![0]!.title}
                  </Link>
                </>
              ) : (
                <>
                  <strong className="font-medium">Protokolleinträge: </strong>
                  <ul className="mt-0.5 list-inside list-disc space-y-0.5 pl-2">
                    {projectRecords!.map((record) => (
                      <li key={record.id}>
                        <Link
                          to={projectRecordModal.getProjectRecordDetailHref({
                            projectRecordId: record.id,
                          })}
                          resetScroll={false}
                        >
                          {record.title}
                        </Link>
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
