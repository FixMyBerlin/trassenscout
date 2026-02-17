import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { LineSquiggle } from "lucide-react"
import { twMerge } from "tailwind-merge"
import { GeometryIcon } from "../Icons/GeometryIcon"
import type { TerraDrawMode } from "./useTerraDrawControl"

type Props = {
  mode: TerraDrawMode
  setMode: (mode: TerraDrawMode) => void
  onClear?: () => void
  getSelectedIds?: () => string[]
  deleteSelected?: () => void
  selectedIds?: string[]
  showPoint?: boolean
  showLine?: boolean
  showPolygon?: boolean
  enabledButtons?: {
    point: boolean
    linestring: boolean
    "freehand-linestring": boolean
    polygon: boolean
    edit: boolean
  }
  trailingButtons?: React.ReactNode
}

/**
 * Toolbar for switching between drawing modes in Terra Draw
 */
export const TerraDrawToolbar = ({
  mode,
  setMode,
  onClear,
  getSelectedIds,
  deleteSelected,
  selectedIds = [],
  showPoint = true,
  showLine = true,
  showPolygon = true,
  enabledButtons = {
    point: true,
    linestring: true,
    "freehand-linestring": true,
    polygon: true,
    edit: false,
  },
  trailingButtons,
}: Props) => {
  // Get selected count - prefer selectedIds prop if provided, otherwise call getSelectedIds
  const selectedCount =
    selectedIds.length > 0 ? selectedIds.length : getSelectedIds ? getSelectedIds().length : 0
  const hasSelection = selectedCount > 0

  // Determine delete button text and handler
  const deleteButtonText = hasSelection ? "Ausgewähltes löschen" : "Alle löschen"
  const deleteButtonTitle = hasSelection ? "Ausgewähltes Element löschen" : "Alle Elemente löschen"

  const handleDelete = () => {
    if (hasSelection && deleteSelected) {
      deleteSelected()
    } else if (onClear) {
      onClear()
    }
  }
  const buttonClass = (isActive: boolean, isDisabled: boolean) =>
    clsx(
      "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isDisabled
        ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
        : isActive
          ? "bg-blue-600 text-white"
          : "cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    )

  return (
    <div className="flex flex-wrap gap-2 rounded-md bg-white p-2 shadow-md">
      {showPoint && (
        <button
          type="button"
          onClick={() => enabledButtons.point && setMode("point")}
          className={buttonClass(mode === "point", !enabledButtons.point)}
          title={
            enabledButtons.point
              ? "Punkt zeichnen"
              : "Deaktiviert - andere Geometrietypen vorhanden"
          }
          disabled={!enabledButtons.point}
        >
          <GeometryIcon type="POINT" className="size-4" />
          Punkt
        </button>
      )}

      {showLine && (
        <>
          <button
            type="button"
            onClick={() => enabledButtons.linestring && setMode("linestring")}
            className={buttonClass(mode === "linestring", !enabledButtons.linestring)}
            title={
              enabledButtons.linestring
                ? "Linie zeichnen"
                : "Deaktiviert - andere Geometrietypen vorhanden"
            }
            disabled={!enabledButtons.linestring}
          >
            <GeometryIcon type="LINE" className="size-4" />
            Linie
          </button>
          <button
            type="button"
            onClick={() => enabledButtons["freehand-linestring"] && setMode("freehand-linestring")}
            className={buttonClass(
              mode === "freehand-linestring",
              !enabledButtons["freehand-linestring"],
            )}
            title={
              enabledButtons["freehand-linestring"]
                ? "Freihand-Linie zeichnen"
                : "Deaktiviert - andere Geometrietypen vorhanden"
            }
            disabled={!enabledButtons["freehand-linestring"]}
          >
            <LineSquiggle className="size-4" />
            Freihand
          </button>
        </>
      )}

      {showPolygon && (
        <button
          type="button"
          onClick={() => enabledButtons.polygon && setMode("polygon")}
          className={buttonClass(mode === "polygon", !enabledButtons.polygon)}
          title={
            enabledButtons.polygon
              ? "Fläche zeichnen"
              : "Deaktiviert - andere Geometrietypen vorhanden"
          }
          disabled={!enabledButtons.polygon}
        >
          <GeometryIcon type="POLYGON" className="size-4" />
          Fläche
        </button>
      )}

      <button
        type="button"
        onClick={() => enabledButtons.edit && setMode("select")}
        className={buttonClass(mode === "select", !enabledButtons.edit)}
        title={
          enabledButtons.edit ? "Ändern/Auswählen" : "Deaktiviert - keine Geometrien vorhanden"
        }
        disabled={!enabledButtons.edit}
      >
        <PencilIcon className="size-4" />
        Ändern
      </button>

      {(onClear || deleteSelected) && (
        <button
          type="button"
          onClick={handleDelete}
          className={twMerge(
            buttonClass(false, false),
            "transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700",
          )}
          title={deleteButtonTitle}
        >
          <TrashIcon className="size-4" />
          {deleteButtonText}
        </button>
      )}

      {trailingButtons}
    </div>
  )
}
