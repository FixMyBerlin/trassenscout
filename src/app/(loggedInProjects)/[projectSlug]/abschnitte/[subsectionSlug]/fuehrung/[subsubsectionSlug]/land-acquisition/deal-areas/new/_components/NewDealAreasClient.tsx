"use client"

import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { blueButtonStyles } from "@/src/core/components/links"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import createDealAreasFromSelection from "@/src/server/dealAreas/mutations/createDealAreasFromSelection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { DealAreaMap } from "./DealAreaMap"
import { DealAreasList } from "./DealAreasList"
import type { PotentialDealArea } from "./potentialDealAreaTypes"

type Props = {
  initialSubsubsection: Awaited<ReturnType<typeof getSubsubsection>>
}

type BufferRadiusForm = {
  bufferRadiusInput: string
}

export function NewDealAreasClient({ initialSubsubsection }: Props) {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const [bufferRadius, setBufferRadius] = useState(20)
  const [potentialDealAreas, setPotentialDealAreas] = useState<PotentialDealArea[]>([])
  const [createDealAreasMutation, { isLoading }] = useMutation(createDealAreasFromSelection)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<BufferRadiusForm>({
    defaultValues: { bufferRadiusInput: "20" },
  })

  const selectedDealAreas = useMemo(
    () => potentialDealAreas.filter((dealArea) => dealArea.selected),
    [potentialDealAreas],
  )

  const applyBufferRadius = () => {
    const raw = form.getValues("bufferRadiusInput")
    const v = Number.parseFloat(String(raw).replace(",", "."))
    if (!Number.isFinite(v) || v < 0) return
    setBufferRadius(v)
    form.setValue("bufferRadiusInput", String(v))
  }

  const handleCreateDealAreas = async () => {
    if (!selectedDealAreas.length) return

    try {
      setSubmitError(null)

      const createdDealAreas = await createDealAreasMutation({
        projectSlug,
        subsubsectionId: initialSubsubsection.id,
        dealAreas: selectedDealAreas.map((dealArea) => ({
          gmlId: dealArea.gmlId,
          geometry: dealArea.geometry,
          parcelGeometry: dealArea.parcelGeometry,
        })),
      })

      setShowSuccess(true)

      const firstCreatedDealAreaId = createdDealAreas[0]?.id
      const targetUrl = subsubsectionLandAcquisitionRoute(
        projectSlug,
        subsectionSlug,
        subsubsectionSlug,
      )

      router.push(
        firstCreatedDealAreaId ? `${targetUrl}?dealAreaId=${firstCreatedDealAreaId}` : targetUrl,
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
          <DealAreaMap
            subsubsection={initialSubsubsection}
            bufferRadius={bufferRadius}
            potentialDealAreas={potentialDealAreas}
            setPotentialDealAreas={setPotentialDealAreas}
          />
        </MapProvider>
      </div>
      <aside className="w-full shrink-0 rounded-md border border-gray-200 bg-white p-4 shadow-xs lg:w-80">
        <FormProvider {...form}>
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
        </FormProvider>
        <div className="mb-4 space-y-3">
          <p className="text-sm text-gray-500">
            {selectedDealAreas.length} von {potentialDealAreas.length} Dealflächen ausgewählt
          </p>
          <FormSuccess message="Dealflächen erfolgreich erstellt" show={showSuccess} />
          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
          <button
            type="button"
            className={clsx(blueButtonStyles, "w-full")}
            onClick={() => {
              void handleCreateDealAreas()
            }}
            disabled={isLoading || selectedDealAreas.length === 0}
          >
            {isLoading ? "Dealflächen werden erstellt..." : "Dealflächen erstellen"}
          </button>
        </div>
        <DealAreasList
          potentialDealAreas={potentialDealAreas}
          setPotentialDealAreas={setPotentialDealAreas}
        />
      </aside>
    </div>
  )
}
