import { PlusIcon } from "@heroicons/react/16/solid"
import { TrashIcon } from "@heroicons/react/24/outline"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { SubsubsectionPanel } from "@/src/components/abschnitte/SubsubsectionPanel"
import { useAcquisitionAreaSelection } from "@/src/components/abschnitte/useAcquisitionAreaSelection"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { FormSuccess } from "@/src/components/core/components/forms/FormSuccess"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { Link } from "@/src/components/core/components/links/Link"
import { blueButtonStyles, whiteButtonStyles } from "@/src/components/core/components/links/styles"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { ProjectRecordNewModal } from "@/src/components/project-records/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/components/project-records/ProjectRecordTable"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { deleteAllAcquisitionAreasForSubsubsectionFn } from "@/src/server/acquisitionAreas/acquisitionAreas.functions"
import { acquisitionAreasBySubsubsectionQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasAbschnitteQueryOptions"
import {
  projectRecordsByAcquisitionAreaQueryOptions,
  projectRecordsBySubsubsectionQueryOptions,
} from "@/src/server/projectRecords/projectRecordsAbschnitteQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"

const subsubsectionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/",
)

type Props = {
  subsubsectionId: number
  subsectionId: number
}

export const SubsubsectionLandAcquisitionContent = ({
  subsubsectionId,
  subsectionId: _subsectionId,
}: Props) => {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = subsubsectionRouteApi.useParams()
  const queryClient = useQueryClient()
  const returnTo = useCurrentReturnTo()
  const { acquisitionAreaId, setAcquisitionAreaId } = useAcquisitionAreaSelection()
  const [isProjectRecordModalOpen, setIsProjectRecordModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProjectRecordId, setCreatedProjectRecordId] = useState<null | number>(null)
  const deleteAllAcquisitionAreasMutation = useMutation({
    mutationFn: deleteAllAcquisitionAreasForSubsubsectionFn,
  })

  const { data: acquisitionAreas = [] } = useQuery({
    ...acquisitionAreasBySubsubsectionQueryOptions({
      projectSlug,
      subsubsectionId,
    }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const selectedAcquisitionArea = acquisitionAreas.find(
    (acquisitionArea) => acquisitionArea.id === acquisitionAreaId,
  )

  const { data: projectRecords = [], refetch: refetchProjectRecords } = useQuery({
    ...projectRecordsByAcquisitionAreaQueryOptions({
      projectSlug,
      acquisitionAreaId: selectedAcquisitionArea!.id,
    }),
    enabled: Boolean(selectedAcquisitionArea),
  })

  const { data: uploadsData, refetch: refetchUploads } = useQuery({
    ...uploadsWithSubsectionsQueryOptions({
      projectSlug,
      where: selectedAcquisitionArea
        ? { acquisitionAreas: { some: { id: selectedAcquisitionArea.id } } }
        : {},
    }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: Boolean(selectedAcquisitionArea),
  })
  const uploads = uploadsData?.uploads ?? []

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

  const handleDeleteAllAcquisitionAreas = async () => {
    if (
      !window.confirm(
        "Alle Verhandlungsflächen dieses Eintrags unwiderruflich löschen? Verknüpfte Projektdokumentation kann entfallen.",
      )
    ) {
      return
    }

    try {
      await deleteAllAcquisitionAreasMutation.mutateAsync({
        data: {
          projectSlug,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: subsubsectionSlug!,
        },
      })
      await setAcquisitionAreaId(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: subsubsectionBySlugQueryOptions({
            projectSlug,
            subsectionSlug: subsectionSlug!,
            subsubsectionSlug: subsubsectionSlug!,
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: acquisitionAreasBySubsubsectionQueryOptions({
            projectSlug,
            subsubsectionId,
          }).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: ["projectRecordsByAcquisitionArea"] }),
        queryClient.invalidateQueries({
          queryKey: projectRecordsBySubsubsectionQueryOptions({
            projectSlug,
            subsubsectionId,
          }).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: ["uploadsWithSubsections"] }),
      ])
    } catch (error) {
      console.error("Error deleting all acquisition areas:", error)
      alert("Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.")
    }
  }

  return (
    <SubsubsectionPanel title="Grunderwerb">
      <div className="space-y-8">
        {acquisitionAreas.length > 1 && (
          <SelectListbox
            value={acquisitionAreaId ?? null}
            onChange={(value) => {
              void setAcquisitionAreaId(value)
            }}
            placeholder="Verhandlungsfläche auswählen"
            options={acquisitionAreas.map((acquisitionArea) => ({
              value: acquisitionArea.id,
              label: `${acquisitionArea.id} - Flurstücknr. ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(subsubsectionSlug!)})`,
            }))}
          />
        )}

        <div className="space-y-3">
          {!acquisitionAreas.length ? (
            <>
              <p className="max-w-xl text-base text-gray-500">
                Es wurden noch keine Verhandlungsflächen angelegt. Legen Sie neue
                Verhandlungsflächen für diesen Eintrag an.
              </p>
              <IfUserCanEdit>
                <div className="pt-2">
                  <Link
                    to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/new"
                    params={subsubsectionParams}
                    button
                    icon="plus"
                  >
                    Verhandlungsflächen anlegen
                  </Link>
                </div>
              </IfUserCanEdit>
            </>
          ) : selectedAcquisitionArea ? (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-700">Allgemeine Informationen</h3>
                <IfUserCanEdit>
                  <Link
                    icon="edit"
                    to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/$acquisitionAreaId/edit"
                    params={{
                      ...subsubsectionParams,
                      acquisitionAreaId: String(selectedAcquisitionArea.id),
                    }}
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
                {projectRecords && projectRecords?.length > 0 ? (
                  <ProjectRecordsTable
                    projectRecords={projectRecords}
                    highlightId={createdProjectRecordId}
                    bleed={false}
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
                  landAcquisitionModuleEnabled
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
                    acquisitionAreaId: selectedAcquisitionArea.id,
                  }}
                />
              </section>

              <section className="mt-10 space-y-3">
                <h2 className="text-lg font-semibold text-gray-700 sm:text-lg">Dokumente</h2>
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
                        acquisitionAreaIds={[selectedAcquisitionArea.id]}
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
              <p className="max-w-xl text-base text-gray-500">
                Nutzen Sie das Dropdown-Menü oder klicken Sie direkt auf eine Fläche in der Karte,
                um den Grunderwerb eine Verhandlungsfläche auszuwählen.
              </p>
              <IfUserCanEdit>
                <div className="pt-1">
                  <Link
                    to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/new"
                    params={subsubsectionParams}
                    button
                    icon="plus"
                  >
                    Weitere Verhandlungsflächen anlegen
                  </Link>
                </div>
              </IfUserCanEdit>
              <IfUserCanEdit>
                <button
                  type="button"
                  className={clsx(whiteButtonStyles, "gap-2 ring-inset")}
                  disabled={deleteAllAcquisitionAreasMutation.isPending}
                  onClick={() => void handleDeleteAllAcquisitionAreas()}
                >
                  <TrashIcon className="size-5" />
                  {deleteAllAcquisitionAreasMutation.isPending
                    ? "Wird gelöscht…"
                    : "Alle Verhandlungsflächen dieses Eintrags löschen"}
                </button>
              </IfUserCanEdit>
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
