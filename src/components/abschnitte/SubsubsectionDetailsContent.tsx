import { PlusIcon } from "@heroicons/react/16/solid"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { SubsubsectionPanel } from "@/src/components/abschnitte/SubsubsectionPanel"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormSuccess } from "@/src/components/core/components/forms/FormSuccess"
import { Link } from "@/src/components/core/components/links/Link"
import {
  formattedEuro,
  formattedLength,
  formattedWidth,
} from "@/src/components/core/components/text/formattedProperties"
import { H2 } from "@/src/components/core/components/text/Headings"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { getFullname } from "@/src/components/core/users/getFullname"
import { subsubsectionLocationLabelMap } from "@/src/components/core/utils/subsubsectionLocationLabelMap"
import { ProjectRecordNewModal } from "@/src/components/project-records/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/components/project-records/ProjectRecordTable"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { acquisitionAreasWithProjectRecordCountQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasAbschnitteQueryOptions"
import { projectRecordsBySubsubsectionQueryOptions } from "@/src/server/projectRecords/projectRecordsAbschnitteQueryOptions"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { linkedSurveyResponseForSubsubsectionQueryOptions } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

type Props = {
  subsubsection: SubsubsectionWithPosition
  className?: string
  header?: React.ReactNode
}

export const SubsubsectionDetailsContent = ({ subsubsection, className, header }: Props) => {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()
  const returnTo = useCurrentReturnTo()
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const locationLabel = subsubsection.location
    ? subsubsectionLocationLabelMap[subsubsection.location]
    : null
  const infrastructureTypeTitles = subsubsection.SubsubsectionInfrastructureTypes.map(
    (type) => type.title,
  ).filter(Boolean)
  const hasLength = subsubsection.lengthM != null
  const hasWidth = subsubsection.width != null
  const hasCostEstimate = subsubsection.costEstimate != null
  const hasGeneralInfoRows = Boolean(
    subsubsection.SubsubsectionTask?.title ||
    locationLabel ||
    hasLength ||
    hasWidth ||
    hasCostEstimate ||
    infrastructureTypeTitles.length > 0 ||
    subsubsection.qualityLevel?.title ||
    subsubsection.SubsubsectionInfra?.title ||
    subsubsection.SubsubsectionStatus?.title ||
    subsubsection.estimatedConstructionDateString ||
    subsubsection.manager,
  )

  const { data: uploadsData, refetch: refetchUploads } = useQuery(
    uploadsWithSubsectionsQueryOptions({
      projectSlug,
      where: { subsubsections: { some: { id: subsubsection.id } } },
    }),
  )
  const uploads = uploadsData?.uploads ?? []

  const { data: projectRecords = [], refetch: refetchProjectRecords } = useQuery(
    projectRecordsBySubsubsectionQueryOptions({
      projectSlug,
      subsubsectionId: subsubsection.id,
    }),
  )
  const { data: acquisitionAreaProjectRecordCounts = [] } = useQuery(
    acquisitionAreasWithProjectRecordCountQueryOptions({
      projectSlug,
      subsubsectionId: subsubsection.id,
    }),
  )
  const acquisitionAreasWithProjectRecords = acquisitionAreaProjectRecordCounts.filter(
    (acquisitionArea) => acquisitionArea.projectRecordCount > 0,
  )

  const subsubsectionParams = {
    projectSlug,
    subsectionSlug: subsectionSlug!,
    subsubsectionSlug: subsubsectionSlug!,
  }

  const buildUploadEditLink = (uploadId: number) => ({
    to: "/$projectSlug/uploads/$uploadId/edit" as const,
    params: { projectSlug, uploadId: String(uploadId) },
    search: returnTo ? { returnTo } : undefined,
  })

  const { data: linkedSurveyResponse } = useQuery(
    linkedSurveyResponseForSubsubsectionQueryOptions({
      projectSlug,
      subsubsectionSlug: subsubsection.slug,
    }),
  )

  return (
    <SubsubsectionPanel title="" className={className} header={header}>
      {hasGeneralInfoRows ? (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sr-only">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-3 text-left text-sm font-semibold text-gray-900"
                  >
                    Attribut
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Wert
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {subsubsection.SubsubsectionTask?.title && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Maßnahmentyp
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {subsubsection.SubsubsectionTask.title}
                    </td>
                  </tr>
                )}
                {locationLabel && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Lage
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {locationLabel}
                    </td>
                  </tr>
                )}
                {hasLength && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Länge
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {formattedLength(subsubsection.lengthM)}
                    </td>
                  </tr>
                )}
                {hasWidth && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Breite
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {formattedWidth(subsubsection.width)}
                    </td>
                  </tr>
                )}
                {hasCostEstimate && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Kostenschätzung
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {formattedEuro(subsubsection.costEstimate)}
                    </td>
                  </tr>
                )}
                {infrastructureTypeTitles.length > 0 && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left align-top text-sm font-normal text-gray-700">
                      Gegenstände der Förderung
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      <div className="flex flex-wrap gap-2">
                        {infrastructureTypeTitles.map((title) => (
                          <span
                            key={title}
                            className="rounded-sm bg-gray-200 px-3 py-1.5 font-medium text-gray-700"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {subsubsection.qualityLevel?.title && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Ausbaustandard
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {subsubsection.qualityLevel.url ? (
                        <Link
                          blank
                          className="flex items-center gap-1 text-gray-400 hover:text-gray-600"
                          href={subsubsection.qualityLevel.url}
                        >
                          {subsubsection.qualityLevel.title}
                        </Link>
                      ) : (
                        subsubsection.qualityLevel.title
                      )}
                    </td>
                  </tr>
                )}
                {subsubsection.SubsubsectionInfra?.title && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Führungsform
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {shortTitle(subsubsection.SubsubsectionInfra.slug)} -{" "}
                      {subsubsection.SubsubsectionInfra.title}
                    </td>
                  </tr>
                )}
                {subsubsection.SubsubsectionStatus?.title && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Phase
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {shortTitle(subsubsection.SubsubsectionStatus.slug)} -{" "}
                      {subsubsection.SubsubsectionStatus.title}
                    </td>
                  </tr>
                )}
                {subsubsection.estimatedConstructionDateString && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Angestrebtes Baujahr
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {subsubsection.estimatedConstructionDateString}
                    </td>
                  </tr>
                )}
                {subsubsection.manager && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Ansprechpartner:in
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {getFullname(subsubsection.manager)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <section className="rounded-md border border-gray-200 bg-white p-4">
          <h3 className="text-base font-medium text-gray-700">Angaben fehlen.</h3>
          <p className="mt-1.5 text-base text-gray-700">
            Erfassen Sie hier Eckdaten wie Typ, Status und Beschreibung. Über Bearbeiten (oben
            rechts) können Sie diese direkt hinzufügen.
          </p>
        </section>
      )}

      <section className="mt-6 space-y-3">
        <H2 className="text-lg font-semibold text-gray-700 sm:text-lg">Protokolleinträge</H2>
        {showSuccess && (
          <FormSuccess message="Protokolleintrag erfolgreich erstellt" show={showSuccess} />
        )}
        {projectRecords.length > 0 ? (
          <ProjectRecordsTable
            projectRecords={projectRecords}
            highlightId={createdProjectRecordId}
            bleed={false}
          />
        ) : (
          <ZeroCase small visible name="Protokolleinträge" />
        )}
        {acquisitionAreasWithProjectRecords.length > 0 && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-medium">Hinweis:</p>
            <p className="mt-1">
              In untergeordneten Verhandlungsflächen gibt es zusätzliche Protokolleinträge:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {acquisitionAreasWithProjectRecords.map((acquisitionArea) => (
                <li key={acquisitionArea.id}>
                  <Link
                    to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                    params={subsubsectionParams}
                    search={{ acquisitionAreaId: String(acquisitionArea.id) }}
                  >
                    Verhandlungsfläche #{acquisitionArea.id} ({acquisitionArea.projectRecordCount}{" "}
                    Protokolleinträge)
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <IfUserCanEdit>
          <button
            onClick={() => setIsProjectRecordModalOpen(true)}
            className={twJoin(primaryButtonClassName, "mt-5 items-center justify-center gap-1")}
          >
            <PlusIcon className="size-3.5" /> Neuer Protokolleintrag
          </button>
        </IfUserCanEdit>

        <ProjectRecordNewModal
          projectSlug={projectSlug}
          landAcquisitionModuleEnabled={
            subsubsection.subsection.project.landAcquisitionModuleEnabled ?? false
          }
          open={isProjectRecordModalOpen}
          onClose={() => setIsProjectRecordModalOpen(false)}
          onSuccess={async (projectRecordId) => {
            setCreatedProjectRecordId(projectRecordId)
            setShowSuccess(true)
            setTimeout(() => {
              setShowSuccess(false)
              setCreatedProjectRecordId(null)
            }, 3000)
            await refetchProjectRecords()
          }}
          initialValues={{ subsubsectionId: subsubsection.id }}
        />
      </section>

      <section className="mt-10 space-y-3">
        <H2 className="text-lg font-semibold text-gray-700 sm:text-lg">Dokumente</H2>
        {linkedSurveyResponse && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Diese Maßnahme wurde aus folgendem Beitrag erstellt:</p>
            <p className="mt-1">
              <Link
                to={`/${projectSlug}/surveys/${linkedSurveyResponse.surveyId}/responses?responseDetails=${linkedSurveyResponse.surveyResponseId}`}
              >
                Beitrag mit der ID {linkedSurveyResponse.surveyResponseId} - Formular{" "}
                {linkedSurveyResponse.surveySlug}
              </Link>
            </p>
          </div>
        )}
        {!uploads.length && <ZeroCase small visible name="Dokumente" />}
        <div className="grid grid-cols-2 gap-3">
          {uploads.map((upload) => (
            <UploadPreviewClickable
              key={upload.id}
              uploadId={upload.id}
              upload={upload}
              projectSlug={projectSlug}
              size="grid"
              editLink={buildUploadEditLink(upload.id)}
              onDeleted={async () => {
                await refetchUploads()
              }}
            />
          ))}
          <IfUserCanEdit>
            <UploadDropzoneContainer className="h-36 rounded-md p-0">
              <UploadDropzone
                fillContainer
                subsubsectionIds={[subsubsection.id]}
                onUploadComplete={async () => {
                  await refetchUploads()
                }}
              />
            </UploadDropzoneContainer>
          </IfUserCanEdit>
        </div>
      </section>

      <SuperAdminLogData data={{ subsubsection, uploads, projectRecords }} />
    </SubsubsectionPanel>
  )
}
