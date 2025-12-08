import { snapGeometryToLine } from "@/src/core/components/Map/TerraDraw/snapToLine"
import type { Geometry } from "geojson"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { extractLineStringForSnapping } from "./extractLineStringForSnapping"

type UseSnappingProps = {
  targetGeometry: Geometry
  thresholdMeters?: number
}

export const useSnapping = ({ targetGeometry, thresholdMeters = 20 }: UseSnappingProps) => {
  const { watch, setValue } = useFormContext()
  const geometry = watch("geometry") as Geometry
  const [preSnapGeometry, setPreSnapGeometry] = useState<Geometry | null>(null)

  const handleSnap = () => {
    if (!geometry) return

    const targetLine = extractLineStringForSnapping(targetGeometry)

    if (!targetLine) {
      alert("Snapping ist für diesen Geometrietyp des Planungsabschnitts nicht möglich.")
      return
    }

    setPreSnapGeometry(geometry)
    const result = snapGeometryToLine(geometry, targetLine, thresholdMeters)
    setValue("geometry", result.snapped, { shouldValidate: true })

    if (result.snappedCount === 0) {
      alert("Keine Punkte innerhalb von 20 Metern zum Planungsabschnitt gefunden.")
    }
  }

  const handleUnsnap = () => {
    if (preSnapGeometry) {
      setValue("geometry", preSnapGeometry, { shouldValidate: true })
      setPreSnapGeometry(null)
    }
  }

  const clearPreSnap = () => {
    setPreSnapGeometry(null)
  }

  return {
    geometry,
    preSnapGeometry,
    handleSnap,
    handleUnsnap,
    clearPreSnap,
  }
}
