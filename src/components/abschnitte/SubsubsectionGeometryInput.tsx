import { useQuery } from "@tanstack/react-query"
import { GeometryDrawingMap } from "@/src/components/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/components/core/components/forms/GeometryInputBase"
import { GeometryDrawingSubsubsectionContextLayers } from "@/src/components/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"

type Props = {
  projectSlug: string
  subsectionSlug: string
  selectedSubsubsectionSlug?: string
}

export const SubsubsectionGeometryInput = ({
  projectSlug,
  subsectionSlug,
  selectedSubsubsectionSlug,
}: Props) => {
  const { data: subsection } = useQuery({
    ...subsectionBySlugQueryOptions({
      projectSlug,
      subsectionSlug,
    }),
    enabled: Boolean(subsectionSlug),
  })
  const { data: subsections = [] } = useQuery(subsectionsQueryOptions({ projectSlug }))
  const { data: subsubsections = [] } = useQuery({
    ...subsubsectionsQueryOptions({
      projectSlug,
      subsectionId: subsection!.id,
    }),
    enabled: Boolean(subsection?.id),
  })

  return (
    <GeometryInputBase label="Geometrie der Maßnahme">
      <GeometryDrawingMap allowedTypes={["point", "line", "polygon"]} subsection={subsection}>
        <GeometryDrawingSubsubsectionContextLayers
          subsections={subsections}
          selectedSubsectionSlug={subsectionSlug}
          subsubsections={subsubsections}
          selectedSubsubsectionSlug={selectedSubsubsectionSlug}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
