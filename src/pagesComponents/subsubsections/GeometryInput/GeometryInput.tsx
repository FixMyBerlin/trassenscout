import { midPoint } from "@/src/core/components/Map/utils"
import { LabeledRadiobuttonGroup } from "@/src/core/components/forms"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import { linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { z } from "zod"
import { GeometryInputMap } from "./GeometryInputMap"

export const GeometryInput = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })

  const { setValue, watch } = useFormContext()
  const [geometryInputMode, setGeometryInputMode] = useState<"MAP" | "RAW">("MAP")
  const geometry = watch("geometry")
  const type = watch("type")
  const LineStringSchema = z.array(z.array(z.number()).min(2).max(2).nonempty()).nonempty()
  const PointSchema = z.array(z.number()).min(2).max(2).nonempty()
  const schemaResult =
    type === "ROUTE" ? LineStringSchema.safeParse(geometry) : PointSchema.safeParse(geometry)

  useEffect(() => {
    const invalidGeometry = !schemaResult.success
    if (invalidGeometry) {
      type === "ROUTE"
        ? setValue("geometry", subsection.geometry)
        : setValue("geometry", midPoint(subsection.geometry))
    }
  }, [schemaResult.success, setValue, subsection.geometry, type])

  return (
    <>
      <LabeledRadiobuttonGroup
        label="Geometrie der Maßnahme"
        scope="type"
        items={[
          { value: "ROUTE", label: "Linie" }, // fka Regelführung (RF)
          { value: "AREA", label: "Punkt" }, // fka Sonderführung (SF)
        ]}
        classNameItemWrapper="flex gap-5 !space-y-0 items-center"
      />
      {type === "ROUTE" ? (
        <div id="geometry-input-help" className="m-0 text-gray-500">
          Klicken Sie innerhalb des blau markierten Planungsabschnitts auf die gewünschte Stelle, um
          die Maßnahme dort zu verorten. Achten Sie darauf, dass die neue Maßnahmelinie nicht auf
          bereits vorhandenen (grau dargestellten) Linien verläuft.
        </div>
      ) : (
        <div id="geometry-input-help" className="m-0 text-gray-500">
          Klicken Sie innerhalb des blau markierten Planungsabschnitts, um den Anfangspunkt der
          Maßnahme zu setzen. Mit einem zweiten Klick legen Sie den Endpunkt fest.
        </div>
      )}
      {geometry && (
        <div>
          <nav>
            <div className="sm:hidden">
              <label htmlFor="geometry-tabs" className="sr-only">
                Geometrie-Eingabemodus
              </label>
              <select
                id="geometry-tabs"
                name="geometry-tabs"
                className="block w-full rounded-md border-gray-300 focus:border-gray-100 focus:ring-gray-500"
                value={geometryInputMode}
                onChange={(event) => {
                  setGeometryInputMode(event.target.value as "MAP" | "RAW")
                }}
              >
                <option value="MAP">Karte</option>
                <option value="RAW">GeoJSON</option>
              </select>
            </div>
            <div className="hidden sm:flex">
              <nav className="-mb-px flex w-full" aria-label="Geometry Input Tabs">
                {[
                  { key: "MAP", label: "Karte" },
                  { key: "RAW", label: "GeoJSON" },
                ].map((tab) => {
                  const current = geometryInputMode === tab.key

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setGeometryInputMode(tab.key as "MAP" | "RAW")}
                      className={clsx(
                        current ? "bg-gray-100" : "bg-gray-50",
                        "flex rounded-t-md px-3 py-2 text-sm",
                        linkStyles,
                      )}
                      aria-current={current ? "page" : undefined}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </nav>

          <div className="rounded-b-md rounded-r-md bg-gray-100 p-2">
            {geometryInputMode === "MAP" ? (
              <MapProvider>
                {schemaResult.success && <GeometryInputMap subsection={subsection} />}
              </MapProvider>
            ) : (
              <LabeledGeometryField
                name="geometry"
                label="Geometry der Achse (`LineString` oder `Point`)"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
