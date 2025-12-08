import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { GeometryInputMap } from "@/src/core/components/forms/GeometryInputMap"

export const SubsectionGeometryInput = () => {
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
      <GeometryInputMap allowedTypes={["line", "polygon"]} />
    </GeometryInputBase>
  )
}
