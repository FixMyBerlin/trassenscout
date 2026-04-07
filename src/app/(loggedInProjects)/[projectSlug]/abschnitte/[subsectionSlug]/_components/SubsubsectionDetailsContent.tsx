"use client"

import { ProjectRecordNewModal } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordTable"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import {
  formattedEuro,
  formattedLength,
  formattedWidth,
  shortTitle,
} from "@/src/core/components/text"
import { H2 } from "@/src/core/components/text/Headings"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { subsubsectionUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { subsubsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { subsubsectionLocationLabelMap } from "@/src/core/utils/subsubsectionLocationLabelMap"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import { TGetSubsubsection } from "@/src/server/subsubsections/queries/getSubsubsection"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/16/solid"
import { clsx } from "clsx"
import { useState } from "react"
import { SubsubsectionPanel } from "./SubsubsectionPanel"

type Props = {
  subsubsection: TGetSubsubsection
  className?: string
  header?: React.ReactNode
}

export const SubsubsectionDetailsContent = ({ subsubsection, className, header }: Props) => {
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const locationLabel = subsubsection.location
    ? subsubsectionLocationLabelMap[subsubsection.location]
    : null
  const infrastructureTypeTitles = subsubsection.SubsubsectionInfrastructureTypes.map(
    (type) => type.title,
  ).filter(Boolean)

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
    <SubsubsectionPanel
      title="Allgemeines"
      action={
        <IfUserCanEdit>
          <Link
            icon="edit"
            href={subsubsectionEditRoute(projectSlug, subsectionSlug!, subsubsectionSlug!)}
          >
            bearbeiten
          </Link>
        </IfUserCanEdit>
      }
      className={className}
      header={header}
    >
        {subsubsection.description && (
          <section className="bg-gray-100 px-4 py-3">
            <Markdown markdown={subsubsection.description} className="text-sm leading-tight" />
          </section>
        )}
        <div className="mt-6 overflow-x-auto rounded-md border border-gray-200">
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
                      Eintragstyp
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
                {subsubsection.lengthM !== null && subsubsection.lengthM !== undefined && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Länge
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {formattedLength(subsubsection.lengthM)}
                    </td>
                  </tr>
                )}
                {subsubsection.width !== null && subsubsection.width !== undefined && (
                  <tr>
                    <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                      Breite
                    </th>
                    <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                      {formattedWidth(subsubsection.width)}
                    </td>
                  </tr>
                )}
                {!!subsubsection.costEstimate && (
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

        <section className="mt-10 space-y-3">
          <H2 className="text-lg font-semibold text-gray-700 sm:text-lg">Protokolleinträge</H2>
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
              className={clsx(blueButtonStyles, "mt-5 items-center justify-center gap-1")}
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

        <section className="mt-10 space-y-3">
          <H2 className="text-lg font-semibold text-gray-700 sm:text-lg">Dokumente</H2>
          {!uploads.length && <ZeroCase small visible name="Dokumente" />}
          <div className="grid grid-cols-2 gap-3">
            {uploads.map((upload) => (
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
            ))}
            <IfUserCanEdit>
              <UploadDropzoneContainer className="h-36 rounded-md p-0">
                <UploadDropzone
                  fillContainer
                  subsubsectionId={subsubsection.id}
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
