import { midPoint } from "@/src/core/components/Map/utils"
import { LabeledRadiobuttonGroup } from "@/src/core/components/forms"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import { linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { useQuery } from "@blitzjs/rpc"
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
  if (!subsection) return null
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
      {geometry &&
        (geometryInputMode === "MAP" ? (
          <MapProvider>
            schemaResult.success && <GeometryInputMap subsection={subsection} />
          </MapProvider>
        ) : (
          <LabeledGeometryField
            name="geometry"
            label="Geometry der Achse (`LineString` oder `Point`)"
          />
        ))}
      <button
        className={linkStyles}
        onClick={() => setGeometryInputMode(geometryInputMode === "MAP" ? "RAW" : "MAP")}
      >
        {geometryInputMode === "MAP"
          ? "Geometrie als GeoJSON bearbeiten"
          : "Geometrie in Karte bearbeiten"}
      </button>
    </>
  )
}
