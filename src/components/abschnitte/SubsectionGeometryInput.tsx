import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { GeometryDrawingMap } from "@/src/components/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/components/core/components/forms/GeometryInputBase"
import { GeometryDrawingSubsectionContextLayers } from "@/src/components/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"

const subsectionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/",
)

export const SubsectionGeometryInput = () => {
  const { projectSlug, subsectionSlug } = subsectionRouteApi.useParams()
  const { data: subsections = [] } = useQuery(subsectionsQueryOptions({ projectSlug }))

  return (
    <GeometryInputBase
      label="Geometrie des Planungsabschnitts"
      allowedGeometryTypesFor="subsection"
    >
      <GeometryDrawingMap allowedTypes={["point", "line", "polygon"]}>
        <GeometryDrawingSubsectionContextLayers
          subsections={subsections}
          selectedSubsectionSlug={subsectionSlug}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
