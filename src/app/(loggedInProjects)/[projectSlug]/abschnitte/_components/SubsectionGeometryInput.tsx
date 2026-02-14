"use client"

import { GeometryDrawingMap } from "@/src/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { GeometryDrawingSubsectionContextLayers } from "@/src/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useQuery } from "@blitzjs/rpc"

export const SubsectionGeometryInput = () => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })

  return (
    <GeometryInputBase
      label="Geometrie des Planungsabschnitts"
      allowedGeometryTypesFor="subsection"
      description={
        <>
          Zeichnen Sie die gewünschte Geometrie auf der Karte. Der Geometrietyp wird automatisch
          erkannt (Linie oder Fläche).{" "}
        </>
      }
    >
      <GeometryDrawingMap allowedTypes={["line", "polygon"]}>
        <GeometryDrawingSubsectionContextLayers
          subsections={subsections}
          selectedSubsectionSlug={subsectionSlug}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
