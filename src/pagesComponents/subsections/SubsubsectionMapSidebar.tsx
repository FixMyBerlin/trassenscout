import { ProjectRecordNewModal } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordTable"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { blueButtonStyles, Link, whiteButtonStyles } from "@/src/core/components/links"
import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { PageDescription } from "@/src/core/components/pages/PageDescription"
import {
  formattedEuro,
  formattedLength,
  formattedWidth,
  shortTitle,
} from "@/src/core/components/text"
import { H2 } from "@/src/core/components/text/Headings"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { subsubsectionUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { subsectionLocationLabelMap } from "@/src/pagesComponents/subsubsections/SubsubsectionForm"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ArrowUpRightIcon, PlusIcon } from "@heroicons/react/16/solid"
import { clsx } from "clsx"
import { useState } from "react"

type Props = {
  subsubsection: SubsubsectionWithPosition
  onClose: () => void
}

export const SubsubsectionMapSidebar = ({ subsubsection, onClose }: Props) => {
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const locationLabel = subsubsection.location
    ? subsectionLocationLabelMap[subsubsection.location]
    : null

  const [{ uploads }, { refetch: refetchUploads }] = useQuery(getUploadsWithSubsections, {
    projectSlug,
    where: { subsubsectionId: subsubsection.id },
  })

  const [projectRecords, { refetch: refetchProjectRecords }] = useQuery(
    getProjectRecordsBySubsubsection,
    {
      projectSlug,
      subsubsectionId: subsubsection.id,
    },
  )

  return (
    <section className="overlflow-y-scroll h-full w-[950px] overflow-x-hidden rounded-md border border-gray-400/10 bg-white p-3 drop-shadow-md">
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <SubsubsectionIcon label={shortTitle(subsubsection.slug)} />
        </div>
        <div className="flex items-center gap-3">
          <IfUserCanEdit>
            <Link
              icon="edit"
              href={Routes.EditSubsubsectionPage({
                projectSlug,
                subsectionSlug: subsectionSlug!,
                subsubsectionSlug: subsubsectionSlug!,
              })}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
          <button
            className={clsx("h-8 w-8! rounded-full! p-0!", whiteButtonStyles)}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>
      {/* UNUSED */}
      {/* <H2 className="mt-2">{subsubsection.subTitle}</H2> */}

      <PageDescription className="mt-5 p-3!">
        <Markdown markdown={subsubsection.description} className="leading-tight" />
      </PageDescription>

      <div className="-mx-3 -my-2 mt-5 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-300 border-b border-b-gray-300">
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
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Eintragstyp
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {subsubsection.SubsubsectionTask.title}
                  </td>
                </tr>
              )}
              {locationLabel && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Lage
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {locationLabel}
                  </td>
                </tr>
              )}
              {subsubsection.lengthM !== null && subsubsection.lengthM !== undefined && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Länge
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {formattedLength(subsubsection.lengthM)}
                  </td>
                </tr>
              )}
              {subsubsection.width !== null && subsubsection.width !== undefined && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Breite
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {formattedWidth(subsubsection.width)}
                  </td>
                </tr>
              )}
              {!!subsubsection.costEstimate && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Kostenschätzung
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {formattedEuro(subsubsection.costEstimate)}
                  </td>
                </tr>
              )}
              {subsubsection.SubsubsectionInfrastructureType?.title && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Fördergegenstand
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {subsubsection.SubsubsectionInfrastructureType.title}
                  </td>
                </tr>
              )}
              {subsubsection.qualityLevel?.title && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Ausbaustandard
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {subsubsection.qualityLevel.url ? (
                      <Link
                        blank
                        className="flex items-center gap-1"
                        href={subsubsection.qualityLevel.url}
                      >
                        {subsubsection.qualityLevel.title} <ArrowUpRightIcon className="h-4 w-4" />
                      </Link>
                    ) : (
                      subsubsection.qualityLevel.title
                    )}
                  </td>
                </tr>
              )}
              {subsubsection.SubsubsectionInfra?.title && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Führungsform
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {shortTitle(subsubsection.SubsubsectionInfra.slug)} -{" "}
                    {subsubsection.SubsubsectionInfra.title}
                  </td>
                </tr>
              )}
              {subsubsection.SubsubsectionStatus?.title && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Phase
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {shortTitle(subsubsection.SubsubsectionStatus.slug)} -{" "}
                    {subsubsection.SubsubsectionStatus.title}
                  </td>
                </tr>
              )}
              {subsubsection.estimatedConstructionDateString && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Angestrebtes Baujahr
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {subsubsection.estimatedConstructionDateString}
                  </td>
                </tr>
              )}
              {subsubsection.manager && (
                <tr>
                  <th className="py-4 pr-3 pl-3 text-left text-sm font-medium text-gray-900">
                    Ansprechpartner:in
                  </th>
                  <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                    {getFullname(subsubsection.manager)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="mt-10">
        <H2>Protokolleinträge</H2>
        {showSuccess && (
          <FormSuccess message="Protokolleintrag erfolgreich erstellt" show={showSuccess} />
        )}
        {projectRecords.length > 0 ? (
          <ProjectRecordsTable
            projectRecords={projectRecords}
            openLinksInNewTab
            highlightId={createdProjectRecordId}
          />
        ) : (
          <ZeroCase small visible name="Protokolleinträge" />
        )}
        <IfUserCanEdit>
          <button
            onClick={() => setIsProjectRecordModalOpen(true)}
            className={clsx(blueButtonStyles, "items-center justify-center gap-1")}
          >
            <PlusIcon className="size-3.5" /> Neuer Protokolleintrag
          </button>
        </IfUserCanEdit>

        <ProjectRecordNewModal
          projectSlug={projectSlug}
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

      <section className="mt-10">
        <H2>Grafiken</H2>
        {!uploads.length && <ZeroCase small visible name="Grafiken" />}
        <div className="grid grid-cols-2 gap-3">
          {uploads.map((upload) => {
            return (
              <UploadPreviewClickable
                key={upload.id}
                uploadId={upload.id}
                projectSlug={projectSlug}
                size="grid"
                editUrl={subsubsectionUploadEditRoute(
                  projectSlug,
                  subsectionSlug!,
                  subsubsectionSlug!,
                  upload.id,
                )}
                onDeleted={async () => {
                  await refetchUploads()
                }}
              />
            )
          })}
          <IfUserCanEdit>
            <UploadDropzoneContainer className="h-28 rounded-md p-0">
              <UploadDropzone
                fillContainer
                subsubsectionId={subsubsection.id}
                onUploadComplete={async (_) => {
                  await refetchUploads()
                }}
              />
            </UploadDropzoneContainer>
          </IfUserCanEdit>
        </div>
      </section>

      <SuperAdminLogData data={{ subsubsection, uploads, projectRecords }} />
    </section>
  )
}
