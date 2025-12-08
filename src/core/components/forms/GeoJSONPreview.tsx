import { linkStyles, whiteButtonStyles } from "@/src/core/components/links"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import type { Geometry } from "geojson"

export const GeoJSONPreviewLink = ({ onOpen }: { onOpen: () => void }) => {
  return (
    <button type="button" onClick={onOpen} className={clsx("cursor-pointer text-sm", linkStyles)}>
      GeoJSON
    </button>
  )
}

export const GeoJSONPreviewPanel = ({
  geometry,
  onEdit,
  onClose,
}: {
  geometry: Geometry | undefined
  onEdit: () => void
  onClose: () => void
}) => {
  return (
    <div className="mt-2 rounded-md border border-gray-300 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">GeoJSON Vorschau</h3>
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={onEdit}
            className={clsx(whiteButtonStyles, "px-3 py-1.5 text-sm")}
          >
            Als GeoJSON bearbeiten
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-hidden"
            aria-label="Schließen"
          >
            <span className="sr-only">Schließen</span>
            <XMarkIcon className="size-6" />
          </button>
        </div>
      </div>
      <pre className="max-h-64 overflow-auto rounded-md bg-gray-50 p-3 text-xs">
        <code>{JSON.stringify(geometry || null, undefined, 2)}</code>
      </pre>
    </div>
  )
}
