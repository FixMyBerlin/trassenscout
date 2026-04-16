"use client"

import { Form } from "@/src/core/components/forms"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { blueButtonStyles } from "@/src/core/components/links"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import createAcquisitionAreasFromSelection from "@/src/server/acquisitionAreas/mutations/createAcquisitionAreasFromSelection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { AcquisitionAreaMap } from "./AcquisitionAreaMap"
import { AcquisitionAreasList } from "./AcquisitionAreasList"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

type Props = {
  initialSubsubsection: SubsubsectionWithPosition
}

type BufferRadiusForm = {
  bufferRadiusInput: string
}

type BufferRadiusControlsProps = {
  onApplyRadius: (radius: number) => void
}

function BufferRadiusControls({ onApplyRadius }: BufferRadiusControlsProps) {
  const form = useFormContext<BufferRadiusForm>()

  const applyBufferRadius = () => {
    const raw = form.getValues("bufferRadiusInput")
    const v = Number.parseFloat(String(raw).replace(",", "."))
    if (!Number.isFinite(v) || v < 0) return
    onApplyRadius(v)
    form.setValue("bufferRadiusInput", String(v))
  }

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="min-w-0 flex-1">
        <LabeledTextField
          name="bufferRadiusInput"
          label="Buffer-Radius um den Eintrag (m)"
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
      <div>
        <button
          type="button"
          className={clsx(blueButtonStyles, "shrink-0")}
          onClick={applyBufferRadius}
        >
          Übernehmen
        </button>
      </div>
    </div>
  )
}

export function NewAcquisitionAreasClient({ initialSubsubsection }: Props) {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const [bufferRadius, setBufferRadius] = useState(20)
  const [potentialAcquisitionAreas, setPotentialAcquisitionAreas] = useState<
    PotentialAcquisitionArea[]
  >([])
  const [createAcquisitionAreasMutation, { isLoading }] = useMutation(
    createAcquisitionAreasFromSelection,
  )
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

      setShowSuccess(true)

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
        error instanceof Error ? error.message : "Dealflächen konnten nicht erstellt werden.",
      )
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <MapProvider>
          <AcquisitionAreaMap
            subsubsection={initialSubsubsection}
            bufferRadius={bufferRadius}
            potentialAcquisitionAreas={potentialAcquisitionAreas}
            setPotentialAcquisitionAreas={setPotentialAcquisitionAreas}
          />
        </MapProvider>
      </div>
      <aside className="w-full shrink-0 rounded-md border border-gray-200 bg-white p-4 shadow-xs lg:w-80">
        <Form
          initialValues={{ bufferRadiusInput: "20" }}
          submitText="Dealflächen erstellen"
          onSubmit={handleCreateAcquisitionAreas}
        >
          <BufferRadiusControls onApplyRadius={setBufferRadius} />
        </Form>
        <div className="mb-4 space-y-3">
          <p className="text-sm text-gray-500">
            {selectedAcquisitionAreas.length} von {potentialAcquisitionAreas.length} Dealflächen
            ausgewählt
          </p>
        </div>
        <AcquisitionAreasList
          potentialAcquisitionAreas={potentialAcquisitionAreas}
          setPotentialAcquisitionAreas={setPotentialAcquisitionAreas}
        />
      </aside>
    </div>
  )
}
