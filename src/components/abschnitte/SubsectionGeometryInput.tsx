import { useQuery } from "@tanstack/react-query"
import { GeometryDrawingMap } from "@/src/components/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/components/core/components/forms/GeometryInputBase"
import { GeometryDrawingSubsectionContextLayers } from "@/src/components/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"

type Props = {
  projectSlug: string
  subsectionSlug?: string
}

export const SubsectionGeometryInput = ({ projectSlug, subsectionSlug }: Props) => {
  const { data: subsections = [] } = useQuery(subsectionsQueryOptions({ projectSlug }))

  return (
    <GeometryInputBase
      label="Geometrie des Planungsabschnitts"
      allowedGeometryTypesFor="subsection"
    >
      <GeometryDrawingMap allowedTypes={["point", "line", "polygon"]}>
        <GeometryDrawingSubsectionContextLayers
          subsections={subsections}
          selectedSubsectionSlug={subsectionSlug ?? ""}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
