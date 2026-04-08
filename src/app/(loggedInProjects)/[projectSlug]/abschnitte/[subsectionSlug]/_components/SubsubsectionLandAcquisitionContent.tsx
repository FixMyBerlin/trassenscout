"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { subsubsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getDealAreasBySubsubsection from "@/src/server/dealAreas/queries/getDealAreasBySubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { useEffect } from "react"
import { SubsubsectionPanel } from "./SubsubsectionPanel"
import { useDealAreaSelection } from "./useDealAreaSelection.nuqs"

type Props = {
  subsubsectionId: number
}

export const SubsubsectionLandAcquisitionContent = ({ subsubsectionId }: Props) => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const { dealAreaId, setDealAreaId } = useDealAreaSelection()

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

      <SuperAdminLogData data={{ dealAreas, selectedDealArea, dealAreaId }} />
    </SubsubsectionPanel>
  )
}
