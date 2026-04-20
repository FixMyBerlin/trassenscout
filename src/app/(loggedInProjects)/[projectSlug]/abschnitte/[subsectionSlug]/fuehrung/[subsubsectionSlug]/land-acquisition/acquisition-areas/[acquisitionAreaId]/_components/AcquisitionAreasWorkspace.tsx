"use client"

import { Form } from "@/src/core/components/forms"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { blueButtonStyles } from "@/src/core/components/links"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import createAcquisitionAreasFromSelection from "@/src/server/acquisitionAreas/mutations/createAcquisitionAreasFromSelection"
import type { AlkisWfsParcelFeatureCollection } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { AcquisitionAreaMap } from "./AcquisitionAreaMap"
import { AcquisitionAreasList } from "./AcquisitionAreasList"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

type BufferRadiusForm = {
  bufferRadiusInput: string
}

function BufferRadiusControls({ onApplyRadius }: { onApplyRadius: (radius: number) => void }) {
  const form = useFormContext<BufferRadiusForm>()

  const applyBufferRadius = () => {
    const raw = form.getValues("bufferRadiusInput")
    const v = Number.parseFloat(String(raw).replace(",", "."))
    if (!Number.isFinite(v) || v < 0) return
    onApplyRadius(v)
    form.setValue("bufferRadiusInput", String(v))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="min-w-0 flex-1">
        <LabeledTextField
          name="bufferRadiusInput"
          label="1. Schritt: Puffer festlegen (m)"
          labelProps={{ className: "mb-2 block text-base font-semibold text-gray-900" }}
          type="number"
          min={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              applyBufferRadius()
            }
          }}
        />
      </div>
      <p className="text-sm text-gray-500">
        Die Geometrie des Eintrags wird um diesen Wert erweitert, um angrenzende Flurstücke zu
        identifizieren und zu potenziellen Verhandlungsflächen zu verschneiden.
      </p>
      <div className="mt-1">
        <button
          type="button"
          className={clsx(blueButtonStyles, "shrink-0")}
          onClick={applyBufferRadius}
        >
          Puffer übernehmen
        </button>
      </div>
    </div>
  )
}

type Props = {
  initialSubsubsection: SubsubsectionWithPosition
  projectSlug: string
  bufferRadius: number
  onApplyRadius: (radius: number) => void
  bufferPolygonFeature: Feature<Polygon | MultiPolygon> | null
  parcels: AlkisWfsParcelFeatureCollection
  isLoading: boolean
  errorMessage: string | null
  basePotentialAcquisitionAreas: PotentialAcquisitionArea[]
  mapHeightClass: string
  desktopSharedHeightClass: string
}

export function AcquisitionAreasWorkspace({
  initialSubsubsection,
  projectSlug,
  bufferRadius,
  onApplyRadius,
  bufferPolygonFeature,
  parcels,
  isLoading,
  errorMessage,
  basePotentialAcquisitionAreas,
  mapHeightClass,
  desktopSharedHeightClass,
}: Props) {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const [potentialAcquisitionAreas, setPotentialAcquisitionAreas] = useState(
    basePotentialAcquisitionAreas,
  )
  const [createAcquisitionAreasMutation] = useMutation(createAcquisitionAreasFromSelection)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Buffer changes remount this component (`key={bufferRadius}`) so state resets. When the WFS
  // request finishes for the same buffer, `parcels` updates without a remount — sync the list once.
  useEffect(() => {
    setPotentialAcquisitionAreas(basePotentialAcquisitionAreas)
  }, [basePotentialAcquisitionAreas])

  const selectedAcquisitionAreas = useMemo(
    () => potentialAcquisitionAreas.filter((acquisitionArea) => acquisitionArea.selected),
    [potentialAcquisitionAreas],
  )

  const handleCreateAcquisitionAreas = async () => {
    if (!selectedAcquisitionAreas.length) return

    try {
      setSubmitError(null)

      const submittable = selectedAcquisitionAreas.filter(
        (da): da is typeof da & { alkisParcelId: string } => da.alkisParcelId != null,
      )
      if (!submittable.length) return

      const createdAcquisitionAreas = await createAcquisitionAreasMutation({
        projectSlug,
        subsubsectionId: initialSubsubsection.id,
        acquisitionAreas: submittable.map((acquisitionArea) => ({
          alkisParcelId: acquisitionArea.alkisParcelId,
          alkisParcelIdSource: acquisitionArea.alkisParcelIdSource,
          geometry: acquisitionArea.geometry,
          parcelGeometry: acquisitionArea.parcelGeometry,
          bufferRadiusM: bufferRadius,
        })),
      })

      const firstCreatedAcquisitionAreaId = createdAcquisitionAreas[0]?.id
      const targetUrl = subsubsectionLandAcquisitionRoute(
        projectSlug,
        subsectionSlug,
        subsubsectionSlug,
      )

      router.push(
        firstCreatedAcquisitionAreaId
          ? `${targetUrl}?acquisitionAreaId=${firstCreatedAcquisitionAreaId}`
          : targetUrl,
      )
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Verhandlungsflächen konnten nicht erstellt werden.",
      )
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-stretch">
      <div className="min-w-0 lg:flex-4">
        <MapProvider>
          <AcquisitionAreaMap
            subsubsection={initialSubsubsection}
            bufferPolygonFeature={bufferPolygonFeature}
            parcels={parcels}
            isLoading={isLoading}
            errorMessage={errorMessage}
            potentialAcquisitionAreas={potentialAcquisitionAreas}
            setPotentialAcquisitionAreas={setPotentialAcquisitionAreas}
            classHeight={mapHeightClass}
          />
        </MapProvider>
      </div>
      <aside
        className={clsx(
          "w-full shrink-0 rounded-md border border-gray-200 bg-white p-6 shadow-xs lg:flex-[3] lg:overflow-y-auto",
          desktopSharedHeightClass,
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Verhandlungsflächen generieren</h2>
            <p className="text-gray-500">
              Erstellen Sie automatisch neue Verhandlungsflächen durch einen räumlichen Abgleich mit
              den ALKIS-Flurstücken.
            </p>
          </div>

          <Form
            className="mt-4 flex flex-col gap-2 space-y-0"
            initialValues={{ bufferRadiusInput: String(bufferRadius) }}
            submitText="Ausgewählte Verhandlungsflächen erstellen"
            onSubmit={handleCreateAcquisitionAreas}
          >
            <BufferRadiusControls onApplyRadius={onApplyRadius} />
            <div className="mt-5 space-y-2 text-gray-500">
              <h3 className="text-base font-semibold text-gray-900">
                2. Schritt: Auswahl der Verhandlungsflächen
              </h3>
              <p>
                Wählen Sie in der Karte oder der Liste die Flächen aus, die Sie für den Grunderwerb
                übernehmen möchten. Die Geometrien können nach der Erstellung jederzeit individuell
                von Ihnen angepasst werden.
              </p>
              <p>
                <span className="italic">Hinweis:</span> Eine Änderung des Puffers berechnet die
                Schnittmenge mit den ALKIS-Daten neu und setzt die aktuelle Auswahl zurück.
              </p>
            </div>
          </Form>

          <div className="space-y-2">
            {submitError && <p className="text-sm text-rose-700">{submitError}</p>}
            <p className="text-sm text-gray-500">
              {selectedAcquisitionAreas.length} von {potentialAcquisitionAreas.length}{" "}
              Verhandlungsflächen ausgewählt
            </p>
            <AcquisitionAreasList
              potentialAcquisitionAreas={potentialAcquisitionAreas}
              setPotentialAcquisitionAreas={setPotentialAcquisitionAreas}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}
