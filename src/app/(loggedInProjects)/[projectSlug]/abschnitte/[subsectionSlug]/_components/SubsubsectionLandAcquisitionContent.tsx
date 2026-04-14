"use client"

import { useAcquisitionAreaSelection } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/_components/useAcquisitionAreaSelection.nuqs"
import { ProjectRecordNewModal } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordTable"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { SelectListbox } from "@/src/core/components/forms/SelectListbox"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import {
  acquisitionAreaEditRoute,
  acquisitionAreaNewRoute,
} from "@/src/core/routes/subsectionRoutes"
import { subsubsectionUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getAcquisitionAreasBySubsubsection from "@/src/server/acquisitionAreas/queries/getAcquisitionAreasBySubsubsection"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/16/solid"
import { GeometryTypeEnum } from "@prisma/client"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { SubsubsectionPanel } from "./SubsubsectionPanel"

type Props = {
  subsubsectionId: number
  subsectionId: number
  subsubsectionType: GeometryTypeEnum
}

export const SubsubsectionLandAcquisitionContent = ({
  subsubsectionId,
  subsectionId,
  subsubsectionType,
}: Props) => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const { acquisitionAreaId, setAcquisitionAreaId } = useAcquisitionAreaSelection()
  const canCreateAcquisitionAreas = subsubsectionType !== GeometryTypeEnum.POINT
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)

  const [acquisitionAreas] = useQuery(
    getAcquisitionAreasBySubsubsection,
    {
      projectSlug,
      subsubsectionId,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const selectedAcquisitionArea = acquisitionAreas.find(
    (acquisitionArea) => acquisitionArea.id === acquisitionAreaId,
  )

  const [allProjectRecords = [], { refetch: refetchProjectRecords }] = useQuery(
    getProjectRecordsBySubsubsection,
    {
      projectSlug,
      subsubsectionId,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const [{ uploads: allUploads = [] } = { uploads: [] }, { refetch: refetchUploads }] = useQuery(
    getUploadsWithSubsections,
    {
      projectSlug,
      where: {
        subsubsectionId,
      },
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const projectRecords = useMemo(
    () =>
      selectedAcquisitionArea
        ? allProjectRecords.filter(
            (projectRecord) => projectRecord.acquisitionAreaId === selectedAcquisitionArea.id,
          )
        : [],
    [allProjectRecords, selectedAcquisitionArea],
  )

  const uploads = useMemo(
    () =>
      selectedAcquisitionArea
        ? allUploads.filter((upload) => upload.acquisitionAreaId === selectedAcquisitionArea.id)
        : [],
    [allUploads, selectedAcquisitionArea],
  )

  useEffect(() => {
    const onlyAcquisitionArea = acquisitionAreas[0]
    if (
      acquisitionAreas.length === 1 &&
      onlyAcquisitionArea &&
      acquisitionAreaId !== onlyAcquisitionArea.id
    ) {
      void setAcquisitionAreaId(onlyAcquisitionArea.id)
    }
  }, [acquisitionAreaId, acquisitionAreas, setAcquisitionAreaId])

  return (
    <SubsubsectionPanel title="Grunderwerb">
      <div className="space-y-8">
        {acquisitionAreas.length > 1 && (
          <SelectListbox
            value={acquisitionAreaId ?? null}
            onChange={(value) => {
              void setAcquisitionAreaId(value)
            }}
            placeholder="Dealfläche auswählen"
            options={acquisitionAreas.map((acquisitionArea) => ({
              value: acquisitionArea.id,
              label: `Dealfläche ${acquisitionArea.id}`,
            }))}
          />
        )}

        <div className="space-y-3">
          {!acquisitionAreas.length ? (
            <>
              <h3 className="text-lg font-semibold text-gray-700">
                Es wurden noch keine Dealflächen angelegt
              </h3>
              <p className="max-w-xl text-base text-gray-500">
                {canCreateAcquisitionAreas
                  ? "Um den Grunderwerb zu verwalten, legen Sie bitte Dealflächen an."
                  : "Für punktförmige Einträge können keine Dealflächen angelegt werden."}
              </p>
              {canCreateAcquisitionAreas && (
                <IfUserCanEdit>
                  <div className="pt-2">
                    <Link
                      href={acquisitionAreaNewRoute(
                        projectSlug,
                        subsectionSlug!,
                        subsubsectionSlug!,
                      )}
                      button
                      icon="plus"
                    >
                      Dealflächen anlegen
                    </Link>
                  </div>
                </IfUserCanEdit>
              )}
            </>
          ) : selectedAcquisitionArea ? (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-700">Allgemeine Informationen</h3>
                <IfUserCanEdit>
                  <Link
                    icon="edit"
                    href={acquisitionAreaEditRoute(
                      projectSlug,
                      subsectionSlug!,
                      subsubsectionSlug!,
                      selectedAcquisitionArea.id,
                    )}
                  >
                    bearbeiten
                  </Link>
                </IfUserCanEdit>
              </div>

              {selectedAcquisitionArea.description && (
                <section className="bg-gray-100 px-4 py-3">
                  <p className="text-sm leading-tight text-gray-700">
                    {selectedAcquisitionArea.description}
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
                          {selectedAcquisitionArea.id}
                        </td>
                      </tr>
                      <tr>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          Flurstücknummer ({selectedAcquisitionArea.parcel.alkisParcelIdSource})
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedAcquisitionArea.parcel.alkisParcelId ??
                            `Parcel ${selectedAcquisitionArea.parcel.id}`}
                        </td>
                      </tr>
                      <tr>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          Phase
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedAcquisitionArea.acquisitionAreaStatus?.title ?? "k.A."}
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
                    bleed={false}
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
                    acquisitionAreaId: selectedAcquisitionArea.id,
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
                        acquisitionAreaId={selectedAcquisitionArea.id}
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

      <SuperAdminLogData
        data={{
          acquisitionAreas,
          selectedAcquisitionArea,
          acquisitionAreaId,
          projectRecords,
          uploads,
        }}
      />
    </SubsubsectionPanel>
  )
}
