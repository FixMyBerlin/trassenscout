type SnappingControlsProps = {
  hasGeometry: boolean
  hasPreSnapGeometry: boolean
  onSnap: () => void
  onUnsnap: () => void
}

export const SnappingControls = ({
  hasGeometry,
  hasPreSnapGeometry,
  onSnap,
  onUnsnap,
}: SnappingControlsProps) => {
  if (!hasGeometry && !hasPreSnapGeometry) {
    return null
  }

  return (
    <div className="flex justify-end gap-2">
      {hasGeometry && (
        <button
          type="button"
          onClick={onSnap}
          className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
          title="Punkte innerhalb 20m zum Planungsabschnitt snappen"
        >
          🧲 Snappen
        </button>
      )}

      {hasPreSnapGeometry && (
        <button
          type="button"
          onClick={onUnsnap}
          className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100"
          title="Snapping rückgängig machen"
        >
          ↩️ Unsnap
        </button>
      )}
    </div>
  )
}
