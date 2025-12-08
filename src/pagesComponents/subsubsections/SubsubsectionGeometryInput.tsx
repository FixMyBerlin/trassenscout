import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { useQuery } from "@blitzjs/rpc"
import { SubsubsectionGeometryInputMap } from "./SubsubsectionGeometryInputMap"

export const SubsubsectionGeometryInput = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
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
      <SubsubsectionGeometryInputMap subsection={subsection} />
    </GeometryInputBase>
  )
}
