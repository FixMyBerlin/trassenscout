"use client"

import { GeometryDrawingMap } from "@/src/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import type { FormApi } from "@/src/core/components/forms/types"
import { GeometryDrawingSubsectionContextLayers } from "@/src/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { useQuery } from "@blitzjs/rpc"

type Props = { form: FormApi<Record<string, unknown>> }

export const SubsectionGeometryInput = ({ form }: Props) => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useSlug("subsectionSlug")
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })

  return (
    <GeometryInputBase
      form={form}
      label="Geometrie des Planungsabschnitts"
      allowedGeometryTypesFor="subsection"
    >
      <GeometryDrawingMap form={form} allowedTypes={["point", "line", "polygon"]}>
        <GeometryDrawingSubsectionContextLayers
          subsections={subsections}
          selectedSubsectionSlug={subsectionSlug}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
