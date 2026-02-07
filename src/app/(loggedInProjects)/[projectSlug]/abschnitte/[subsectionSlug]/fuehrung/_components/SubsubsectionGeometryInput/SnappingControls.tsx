import { snapGeometryToLine } from "@/src/core/components/Map/TerraDraw/snapToLine"
import type { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import type { Geometry } from "geojson"
import { extractLineStringForSnapping } from "./extractLineStringForSnapping"

type Props = {
  subsection: TGetSubsection
  geometry: Geometry | undefined
  handleChange: (geometry: Geometry | null, geometryType: string | null) => void
  updateTerraDraw: (geometry: Geometry | null, ignoreChangeEvents?: boolean) => void
  thresholdMeters?: number
}

export const SnappingControls = ({
  subsection,
  geometry,
  handleChange,
  updateTerraDraw,
  thresholdMeters = 20,
}: Props) => {
  if (!geometry) {
    return null
  }

  const handleSnap = () => {
    const targetLine = extractLineStringForSnapping(subsection.geometry)

    if (!targetLine) {
      alert("Snapping ist für diesen Geometrietyp des Planungsabschnitts nicht möglich.")
      return
    }

    const result = snapGeometryToLine(geometry, targetLine, thresholdMeters)

    updateTerraDraw(result.snapped, false)
    handleChange(result.snapped, result.snapped.type)

    if (result.snappedCount === 0) {
      alert("Keine Punkte innerhalb von 20 Metern zum Planungsabschnitt gefunden.")
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={handleSnap}
        className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
        title="Punkte innerhalb 20m zum Planungsabschnitt snappen"
      >
        🧲 Snappen
      </button>
    </div>
  )
}
