import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import clsx from "clsx"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import { type KeyboardEvent, useMemo, useState } from "react"
import { MapProvider } from "react-map-gl/maplibre"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { createAcquisitionAreasFromSelectionFn } from "@/src/server/acquisitionAreas/acquisitionAreas.functions"
import type { AlkisWfsParcelFeatureCollection } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { AcquisitionAreaMap } from "./AcquisitionAreaMap"
import { AcquisitionAreasList } from "./AcquisitionAreasList"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

function BufferRadiusControls({ onApplyRadius }: { onApplyRadius: (radius: number) => void }) {
  const form = useCoreAppFormContext()

  const applyBufferRadius = () => {
    const raw = form.getFieldValue("bufferRadiusInput")
    const v = Number.parseFloat(String(raw).replace(",", "."))
    if (!Number.isFinite(v) || v < 0) return
    onApplyRadius(v)
    form.setFieldValue("bufferRadiusInput", String(v))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="min-w-0 flex-1">
        <form.AppField name="bufferRadiusInput">
          {(field) => (
            <field.TextField
              label="1. Schritt: Puffer festlegen (m)"
              labelProps={{ className: "mb-2 block text-base font-semibold text-gray-900" }}
              type="number"
              min={0}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  applyBufferRadius()
                }
              }}
            />
          )}
        </form.AppField>
      </div>
      <p className="text-sm text-gray-500">
        Die Geometrie des Eintrags wird um diesen Wert erweitert, um angrenzende Flurstücke zu
        identifizieren und zu potenziellen Verhandlungsflächen zu verschneiden.
      </p>
      <div className="mt-1">
        <button
          type="button"
          className={clsx(primaryButtonClassName, "shrink-0")}
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
  const navigate = useNavigate()
  const [potentialAcquisitionAreas, setPotentialAcquisitionAreas] = useState(
    basePotentialAcquisitionAreas,
  )
  const [prevBasePotentialAcquisitionAreas, setPrevBasePotentialAcquisitionAreas] = useState(
    basePotentialAcquisitionAreas,
  )
  if (basePotentialAcquisitionAreas !== prevBasePotentialAcquisitionAreas) {
    setPrevBasePotentialAcquisitionAreas(basePotentialAcquisitionAreas)
    setPotentialAcquisitionAreas(basePotentialAcquisitionAreas)
  }
  const createAcquisitionAreasMutation = useMutation({
    mutationFn: createAcquisitionAreasFromSelectionFn,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedAcquisitionAreas = useMemo(
    () => potentialAcquisitionAreas.filter((acquisitionArea) => acquisitionArea.selected),
    [potentialAcquisitionAreas],
  )

  const handleCreateAcquisitionAreas = async () => {
    if (!selectedAcquisitionAreas.length) {
      setSubmitError("Bitte wählen Sie mindestens eine Verhandlungsfläche aus.")
      return
    }

    try {
      setSubmitError(null)

      const submittable = selectedAcquisitionAreas.filter(
        (da): da is typeof da & { alkisParcelId: string } => da.alkisParcelId != null,
      )
      if (!submittable.length) {
        setSubmitError("Die ausgewählten Verhandlungsflächen konnten nicht verarbeitet werden.")
        return
      }

      const createdAcquisitionAreas = await createAcquisitionAreasMutation.mutateAsync({
        data: {
          projectSlug,
          subsubsectionId: initialSubsubsection.id,
          acquisitionAreas: submittable.map((acquisitionArea) => ({
            alkisParcelId: acquisitionArea.alkisParcelId,
            alkisParcelIdSource: acquisitionArea.alkisParcelIdSource,
            geometry: acquisitionArea.geometry,
            parcelGeometry: acquisitionArea.parcelGeometry,
            bufferRadiusM: bufferRadius,
            mode: acquisitionArea.existingAcquisitionAreaId
              ? acquisitionArea.existingMode
              : "create",
          })),
        },
      })

      const firstCreatedAcquisitionAreaId = createdAcquisitionAreas[0]?.id

      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition",
        params: {
          projectSlug,
          subsectionSlug: initialSubsubsection.subsection.slug,
          subsubsectionSlug: initialSubsubsection.slug,
        },
        ...(firstCreatedAcquisitionAreaId
          ? { search: { acquisitionAreaId: String(firstCreatedAcquisitionAreaId) } }
          : {}),
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Verhandlungsflächen konnten nicht erstellt werden.",
      )
    }
  }

  const form = useAppForm({
    defaultValues: { bufferRadiusInput: String(bufferRadius) },
    onSubmit: async () => {
      await handleCreateAcquisitionAreas()
    },
  })

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

          <FormShell
            form={form}
            formError={submitError}
            className="mt-4 flex flex-col gap-2 space-y-0"
            submitText="Ausgewählte Verhandlungsflächen erstellen"
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
          </FormShell>

          <div className="space-y-2">
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
