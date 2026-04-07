"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Link } from "@/src/core/components/links"
import { subsubsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getDealAreasBySubsubsection from "@/src/server/dealAreas/queries/getDealAreasBySubsubsection"
import { useQuery } from "@blitzjs/rpc"
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
        <select
          value={dealAreaId ?? ""}
          onChange={(event) => {
            const value = event.target.value
            void setDealAreaId(value ? Number(value) : null)
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
        >
          <option value="">{dealAreas.length ? "Dealfläche auswählen" : "Keine Dealflächen vorhanden"}</option>
          {dealAreas.map((dealArea) => (
            <option key={dealArea.id} value={dealArea.id}>
              {`Dealfläche ${dealArea.id}${dealArea.dealAreaStatus?.title ? ` - ${dealArea.dealAreaStatus.title}` : ""}`}
            </option>
          ))}
        </select>

        <div className="space-y-3">
          {selectedDealArea ? (
            <>
              <h3 className="text-lg font-semibold text-gray-700">
                {`Dealfläche ${selectedDealArea.id}`}
              </h3>
              <p className="max-w-xl text-base text-gray-500">
                Die Detailansicht für ausgewählte Dealflächen wird im nächsten Schritt in dieses
                Panel integriert.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-700">
                Es wurde noch keine Dealfläche ausgewählt
              </h3>
              <p className="max-w-xl text-base text-gray-500">
                Bitte wählen Sie eine Dealfläche aus, um den Grunderwerb zu managen. Dies können
                Sie über den Dropdown tun oder später per Klick auf die lila Fläche in der Karte.
              </p>
            </>
          )}
        </div>
      </div>
    </SubsubsectionPanel>
  )
}
