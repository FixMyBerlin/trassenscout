import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { SubsectionGeometryInputMap } from "./SubsectionGeometryInputMap"

export const SubsectionGeometryInput = () => {
  return (
    <GeometryInputBase
      label="Geometrie des Planungsabschnitts"
      description={
        <>
          Zeichnen Sie die gewünschte Geometrie auf der Karte. Der Geometrietyp wird automatisch
          erkannt (Punkt, Linie oder Fläche).{" "}
        </>
      }
    >
      <SubsectionGeometryInputMap />
    </GeometryInputBase>
  )
}
