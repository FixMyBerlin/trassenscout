import { midPoint } from "@/src/core/components/Map/utils"
import { LabeledRadiobuttonGroup } from "@/src/core/components/forms"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { useQuery } from "@blitzjs/rpc"
import { useEffect } from "react"
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
  const geometry = watch("geometry")
  const type = watch("type")
  console.log({ geometry })
  console.log({ subsection })
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
      <MapProvider>
        {schemaResult.success && <GeometryInputMap subsection={subsection} />}
      </MapProvider>

      {/* Disabled for now. We don't really need this. And might have cause issues with how the map worked on staging/production */}
      {/* <details className="rounded border-gray-300 p-4 open:border open:bg-gray-50">
        <summary className="mb-4 cursor-pointer text-sm font-medium text-gray-700">
          Geometrie
        </summary>
        <LabeledGeometryField
          name="geometry"
          label="Geometry der Achse (`LineString` oder `Point`)"
        />
      </details> */}
    </>
  )
}
