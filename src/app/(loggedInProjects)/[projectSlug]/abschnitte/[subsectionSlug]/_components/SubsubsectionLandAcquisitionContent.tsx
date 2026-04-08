"use client"

import { ProjectRecordNewModal } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordTable"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import { subsubsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { subsubsectionUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getDealAreasBySubsubsection from "@/src/server/dealAreas/queries/getDealAreasBySubsubsection"
import getProjectRecordsByDealArea from "@/src/server/projectRecords/queries/getProjectRecordsByDealArea"
import getUploadsByDealArea from "@/src/server/uploads/queries/getUploadsByDealArea"
import { useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { SubsubsectionPanel } from "./SubsubsectionPanel"
import { useDealAreaSelection } from "./useDealAreaSelection.nuqs"

type Props = {
  subsubsectionId: number
  subsectionId: number
}

export const SubsubsectionLandAcquisitionContent = ({ subsubsectionId, subsectionId }: Props) => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const { dealAreaId, setDealAreaId } = useDealAreaSelection()
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)

  const [dealAreas] = useQuery(
    getDealAreasBySubsubsection,
    {
      projectSlug,
      subsubsectionId,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const selectedDealArea = dealAreas.find((dealArea) => dealArea.id === dealAreaId)

  const [projectRecords = [], { refetch: refetchProjectRecords }] = useQuery(
    getProjectRecordsByDealArea,
    {
      projectSlug,
      dealAreaId: selectedDealArea?.id ?? 0,
    },
    {
      enabled: !!selectedDealArea,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const [{ uploads = [] } = { uploads: [] }, { refetch: refetchUploads }] = useQuery(
    getUploadsByDealArea,
    {
      projectSlug,
      dealAreaId: selectedDealArea?.id ?? 0,
    },
    {
      enabled: !!selectedDealArea,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  useEffect(() => {
    const onlyDealArea = dealAreas[0]
    if (dealAreas.length === 1 && onlyDealArea && dealAreaId !== onlyDealArea.id) {
      void setDealAreaId(onlyDealArea.id)
    }
  }, [dealAreaId, dealAreas, setDealAreaId])

  return (
    <SubsubsectionPanel
      title="Grunderwerb"
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
    >
      <div className="space-y-8">
        {dealAreas.length > 1 && (
          <select
            value={dealAreaId ?? ""}
            onChange={(event) => {
              const value = event.target.value
              void setDealAreaId(value ? Number(value) : null)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="">Dealfläche auswählen</option>
            {dealAreas.map((dealArea) => (
              <option key={dealArea.id} value={dealArea.id}>
                {`Dealfläche ${dealArea.parcel.officialId ?? dealArea.id}`}
              </option>
            ))}
          </select>
        )}

        <div className="space-y-3">
          {!dealAreas.length ? (
            <>
              <h3 className="text-lg font-semibold text-gray-700">
                Es wurden noch keine Dealflächen angelegt
              </h3>
              <p className="max-w-xl text-base text-gray-500">
                Um den Grunderwerb zu verwalten, legen Sie bitte Dealflächen an.
              </p>
            </>
          ) : selectedDealArea ? (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-700">Allgemeine Informationen</h3>
                <IfUserCanEdit>
                  <Link
                    icon="edit"
                    href={subsubsectionEditRoute(projectSlug, subsectionSlug!, subsubsectionSlug!)}
                  >
                    bearbeiten
                  </Link>
                </IfUserCanEdit>
              </div>

              {selectedDealArea.description && (
                <section className="bg-gray-100 px-4 py-3">
                  <p className="text-sm leading-tight text-gray-700">
                    {selectedDealArea.description}
                  </p>
                </section>
              )}

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
                      <tr>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          ID
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedDealArea.id}
                        </td>
                      </tr>
                      <tr>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          Flurstücknummer
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedDealArea.parcel.officialId ??
                            `Parcel ${selectedDealArea.parcel.id}`}
                        </td>
                      </tr>
                      <tr>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          Phase
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedDealArea.dealAreaStatus?.title ?? "k.A."}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <section className="mt-10 space-y-3">
                <h2 className="text-lg font-semibold text-gray-700 sm:text-lg">
                  Protokolleinträge
                </h2>
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
                  <p className="my-4 text-base text-gray-500">
                    Es wurden noch keine Protokolleinträge eingetragen.
                  </p>
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
                  initialValues={{
                    subsectionId,
                    subsubsectionId,
                    dealAreaId: selectedDealArea.id,
                  }}
                />
              </section>

              <section className="mt-10 space-y-3">
                <h2 className="text-lg font-semibold text-gray-700 sm:text-lg">Dokumente</h2>
                {!uploads.length && (
                  <p className="my-4 text-base text-gray-500">
                    Es wurden noch keine Dokumente eingetragen.
                  </p>
                )}
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
                        subsectionId={subsectionId}
                        subsubsectionId={subsubsectionId}
                        dealAreaId={selectedDealArea.id}
                        onUploadComplete={async () => {
                          await refetchUploads()
                        }}
                      />
                    </UploadDropzoneContainer>
                  </IfUserCanEdit>
                </div>
              </section>
            </section>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-700">
                Es wurde noch keine Dealfläche ausgewählt
              </h3>
              <p className="max-w-xl text-base text-gray-500">
                Bitte wählen Sie eine Dealfläche aus, um den Grunderwerb zu managen. Dies können Sie
                über den Dropdown tun oder später per Klick auf die lila Fläche in der Karte.
              </p>
            </>
          )}
        </div>
      </div>

      <SuperAdminLogData data={{ dealAreas, selectedDealArea, dealAreaId, projectRecords, uploads }} />
    </SubsubsectionPanel>
  )
}
