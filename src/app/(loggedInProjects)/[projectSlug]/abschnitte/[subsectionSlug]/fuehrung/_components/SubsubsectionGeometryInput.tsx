"use client"

import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { GeometryInputMap } from "@/src/core/components/forms/GeometryInputMap"
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
    <GeometryInputBase
      label="Geometrie des Eintrags"
      description={
        <>
          Zeichnen Sie die gewünschte Geometrie auf der Karte. Der Geometrietyp wird automatisch
          erkannt (Punkt, Linie oder Fläche). Mit &ldquo;Snappen&rdquo; können Sie die Geometrie am
          Planungsabschnitt ausrichten.
        </>
      }
    >
      <GeometryInputMap
        allowedTypes={["point", "line", "polygon"]}
        subsection={subsection}
        subsections={subsections}
        selectedSubsectionSlug={subsectionSlug}
        subsubsections={subsubsections}
        selectedSubsubsectionSlug={subsubsectionSlug}
      />
    </GeometryInputBase>
  )
}
