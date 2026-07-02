import { Link } from "@/src/components/core/components/links/Link"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"

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
  className?: string
}

export const UploadVerknuepfungen = ({
  projectSlug,
  landAcquisitionModuleEnabled,
  subsubsections,
  acquisitionAreas,
  projectRecords,
  projectRecordEmail,
  surveyResponse,
  className,
}: Props) => {
  const hasSubsubsection = subsubsections?.length > 0
  const hasProjectRecords = projectRecords != null && projectRecords.length > 0
  const hasAcquisitionAreas = landAcquisitionModuleEnabled && acquisitionAreas.length > 0
  const hasProjectRecordEmail = projectRecordEmail !== null
  const hasSurveyResponse = surveyResponse !== null
  const projectRecordModal = useProjectRecordModal()
  const hasRelations =
    hasSubsubsection ||
    hasAcquisitionAreas ||
    hasProjectRecords ||
    hasProjectRecordEmail ||
    hasSurveyResponse

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
                    to={
                      projectRecordModal
                        ? projectRecordModal.getProjectRecordDetailHref({
                            projectRecordId: projectRecords![0]!.id,
                          })
                        : "/$projectSlug/project-records/$projectRecordId"
                    }
                    params={
                      projectRecordModal
                        ? undefined
                        : {
                            projectSlug,
                            projectRecordId: String(projectRecords![0]!.id),
                          }
                    }
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
                          to={
                            projectRecordModal
                              ? projectRecordModal.getProjectRecordDetailHref({
                                  projectRecordId: record.id,
                                })
                              : "/$projectSlug/project-records/$projectRecordId"
                          }
                          params={
                            projectRecordModal
                              ? undefined
                              : {
                                  projectSlug,
                                  projectRecordId: String(record.id),
                                }
                          }
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
                Beitrag mit der ID {surveyResponse.id} - Formular{" "}
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
        </ul>
      ) : (
        <p className="mt-1.5 text-sm">Dieses Dokument hat keine Verknüpfungen.</p>
      )}
    </section>
  )
}
