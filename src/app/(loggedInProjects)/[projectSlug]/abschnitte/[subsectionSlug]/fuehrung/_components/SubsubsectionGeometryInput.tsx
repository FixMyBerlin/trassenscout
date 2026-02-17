"use client"

import { GeometryDrawingMap } from "@/src/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { GeometryDrawingSubsubsectionContextLayers } from "@/src/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"

export const SubsubsectionGeometryInput = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, {
    projectSlug,
    where: { subsectionId: subsection.id },
  })

  return (
    <GeometryInputBase label="Geometrie des Eintrags">
      <GeometryDrawingMap allowedTypes={["point", "line", "polygon"]} subsection={subsection}>
        <GeometryDrawingSubsubsectionContextLayers
          subsections={subsections}
          selectedSubsectionSlug={subsectionSlug}
          subsubsections={subsubsections}
          selectedSubsubsectionSlug={subsubsectionSlug}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
