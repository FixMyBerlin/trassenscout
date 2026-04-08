"use client"

import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { blueButtonStyles } from "@/src/core/components/links"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import clsx from "clsx"
import { useState } from "react"
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
  const [bufferRadius, setBufferRadius] = useState(20)
  const [potentialDealAreas, setPotentialDealAreas] = useState<PotentialDealArea[]>([])

  const form = useForm<BufferRadiusForm>({
    defaultValues: { bufferRadiusInput: "20" },
  })

  const applyBufferRadius = () => {
    const raw = form.getValues("bufferRadiusInput")
    const v = Number.parseFloat(String(raw).replace(",", "."))
    if (!Number.isFinite(v) || v < 0) return
    setBufferRadius(v)
    form.setValue("bufferRadiusInput", String(v))
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
        <DealAreasList
          potentialDealAreas={potentialDealAreas}
          setPotentialDealAreas={setPotentialDealAreas}
        />
      </aside>
    </div>
  )
}
