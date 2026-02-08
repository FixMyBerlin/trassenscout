"use client"

import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { GeometryInputMap } from "@/src/core/components/forms/GeometryInputMap"
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
      description={
        <>
          Zeichnen Sie die gewünschte Geometrie auf der Karte. Der Geometrietyp wird automatisch
          erkannt (Linie oder Fläche).{" "}
        </>
      }
    >
      <GeometryInputMap
        allowedTypes={["line", "polygon"]}
        subsections={subsections}
        selectedSubsectionSlug={subsectionSlug}
      />
    </GeometryInputBase>
  )
}
