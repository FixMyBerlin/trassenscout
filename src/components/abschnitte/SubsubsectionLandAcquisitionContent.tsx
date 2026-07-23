import { TrashIcon } from "@heroicons/react/24/outline"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { twJoin } from "tailwind-merge"
import { SubsubsectionPanel } from "@/src/components/abschnitte/SubsubsectionPanel"
import { useAcquisitionAreaSelection } from "@/src/components/abschnitte/useAcquisitionAreaSelection"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormSuccess } from "@/src/components/core/components/forms/FormSuccess"
import { SelectListbox } from "@/src/components/core/components/forms/SelectListbox"
import { linkIcons, Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectRecordNewModal } from "@/src/components/project-records/ProjectRecordNewModal"
import { ProjectRecordsTable } from "@/src/components/project-records/ProjectRecordTable"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { deleteAllAcquisitionAreasForSubsubsectionFn } from "@/src/server/acquisitionAreas/acquisitionAreas.functions"
import { acquisitionAreasBySubsubsectionQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasAbschnitteQueryOptions"
import {
  projectRecordsByAcquisitionAreaQueryOptions,
  projectRecordsBySubsubsectionQueryOptions,
} from "@/src/server/projectRecords/projectRecordsAbschnitteQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

type Props = {
  subsubsectionId: number
  subsectionId: number
  className?: string
}

export const SubsubsectionLandAcquisitionContent = ({
  subsubsectionId,
  subsectionId: _subsectionId,
  className,
}: Props) => {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()
  const queryClient = useQueryClient()
  const { acquisitionAreaId, setAcquisitionAreaId } = useAcquisitionAreaSelection()
  const userCanEdit = useUserCan().edit
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
    ...(selectedAcquisitionArea
      ? projectRecordsByAcquisitionAreaQueryOptions({
          projectSlug,
          acquisitionAreaId: selectedAcquisitionArea.id,
        })
      : {
          queryKey: ["projectRecordsByAcquisitionArea", "disabled"] as const,
          queryFn: () => Promise.resolve([]),
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

  const handleDeleteAllAcquisitionAreas = async () => {
    if (
      !window.confirm(
        "Alle Verhandlungsflächen dieser Maßnahme unwiderruflich löschen? Verknüpfte Projektdokumentation kann entfallen.",
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
    <SubsubsectionPanel title="" className={className}>
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
            <p className="max-w-xl text-base text-gray-500">
              {userCanEdit
                ? "Es wurden noch keine Verhandlungsflächen angelegt. Legen Sie neue Verhandlungsflächen für diese Maßnahme an."
                : "Es wurden noch keine Verhandlungsflächen angelegt."}
            </p>
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
                  <table className={tableClassName}>
                    <thead className="sr-only">
                      <tr className={tableHeadRowClassName}>
                        <th scope="col" className={tableHeadCellClassName}>
                          Attribut
                        </th>
                        <th scope="col" className={tableHeadCellClassName}>
                          Wert
                        </th>
                      </tr>
                    </thead>
                    <tbody className={tableBodyClassName}>
                      <tr className={tableRowClassName}>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          ID
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedAcquisitionArea.id}
                        </td>
                      </tr>
                      <tr className={tableRowClassName}>
                        <th className="py-4 pr-3 pl-4 text-left text-sm font-normal text-gray-700">
                          Flurstücknummer ({selectedAcquisitionArea.parcel.alkisParcelIdSource})
                        </th>
                        <td className="px-4 py-4 text-sm wrap-break-word text-gray-400">
                          {selectedAcquisitionArea.parcel.alkisParcelId ??
                            `Parcel ${selectedAcquisitionArea.parcel.id}`}
                        </td>
                      </tr>
                      <tr className={tableRowClassName}>
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
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-700 sm:text-lg">
                    Protokolleinträge
                  </h2>
                  <IfUserCanEdit>
                    <button
                      type="button"
                      onClick={() => setIsProjectRecordModalOpen(true)}
                      className={twJoin(
                        "inline-flex cursor-pointer items-center gap-1",
                        linkStyles,
                      )}
                    >
                      {linkIcons.plus}
                      Neuer Protokolleintrag
                    </button>
                  </IfUserCanEdit>
                </div>
                {showSuccess && (
                  <FormSuccess message="Protokolleintrag erfolgreich erstellt" show={showSuccess} />
                )}
                {projectRecords && projectRecords?.length > 0 ? (
                  <ProjectRecordsTable
                    projectRecords={projectRecords}
                    highlightId={createdProjectRecordId}
                    withTopBorder
                  />
                ) : (
                  <div className="border-t border-gray-200 pt-3">
                    <ZeroCase small visible name="Protokolleinträge" />
                  </div>
                )}

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
                <div className="flex flex-col gap-2">
                  <UploadTable
                    projectSlug={projectSlug}
                    withAction={false}
                    withRelations={false}
                    uploads={uploads}
                    onDelete={async () => {
                      await refetchUploads()
                    }}
                  />
                  <IfUserCanEdit>
                    <UploadDropzone
                      projectSlug={projectSlug}
                      acquisitionAreaIds={[selectedAcquisitionArea.id]}
                      onUploadComplete={async () => {
                        await refetchUploads()
                      }}
                    />
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
                <button
                  type="button"
                  className={twJoin(secondaryButtonClassName, "gap-2 ring-inset")}
                  disabled={deleteAllAcquisitionAreasMutation.isPending}
                  onClick={() => void handleDeleteAllAcquisitionAreas()}
                >
                  <TrashIcon className="size-5" />
                  {deleteAllAcquisitionAreasMutation.isPending
                    ? "Wird gelöscht…"
                    : "Alle Verhandlungsflächen dieser Maßnahme löschen"}
                </button>
              </IfUserCanEdit>
            </>
          )}
        </div>

        <IfUserCanEdit>
          <Link
            button
            icon="plus"
            to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/new"
            params={subsubsectionParams}
          >
            Weitere Verhandlungsflächen anlegen
          </Link>
        </IfUserCanEdit>
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
