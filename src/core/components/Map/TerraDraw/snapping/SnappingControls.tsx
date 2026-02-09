import { MagnetIcon } from "@/src/core/components/Map/Icons/MagnetIcon"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { extractLineStringForSnapping } from "./extractLineStringForSnapping"
import { snapGeometryToLine } from "./snapToLine"

type Props = {
  subsection: TGetSubsection
  geometry: SupportedGeometry | undefined
  handleChange: (geometry: SupportedGeometry | null, geometryType: string | null) => void
  updateTerraDraw: (geometry: SupportedGeometry | null, ignoreChangeEvents?: boolean) => void
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
    <button
      type="button"
      onClick={handleSnap}
      className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      title="Punkte innerhalb 20m zum Planungsabschnitt snappen"
    >
      <MagnetIcon className="size-4" />
      Snappen
    </button>
  )
}
