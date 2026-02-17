import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { LineSquiggle } from "lucide-react"
import { twMerge } from "tailwind-merge"
import { GeometryIcon } from "../Icons/GeometryIcon"
import type { TerraDrawMode } from "./useTerraDrawControl"

function Divider() {
  return <div className="-my-2 w-px shrink-0 self-stretch bg-gray-200" aria-hidden />
}

const DRAW_MODES_ORDER = ["point", "linestring", "freehand-linestring", "polygon"] as const

type TerraDrawDrawMode = (typeof DRAW_MODES_ORDER)[number]

type Props = {
  mode: TerraDrawMode
  setMode: (mode: TerraDrawMode) => void
  onClear?: () => void
  deleteSelected?: () => void
  selectedIds: string[]
  hasGeometries: boolean
  showPoint: boolean
  showLine: boolean
  showPolygon: boolean
  enabledButtons: {
    point: boolean
    linestring: boolean
    "freehand-linestring": boolean
    polygon: boolean
    edit: boolean
  }
  trailingButtons?: React.ReactNode
}

/** When in select mode with geometries, which Stift to show as active (from enabled state). */
function getDisplayDrawModeFromEnabled(enabledButtons: Props["enabledButtons"]) {
  const { point, linestring, polygon, "freehand-linestring": freehand } = enabledButtons

  if (point && !linestring && !polygon) return "point"
  if (polygon && !point && !linestring) return "polygon"
  if (linestring || freehand) return "linestring"

  return null
}

/** First draw mode that is both shown (show*) and allowed by current geometry (enabledButtons). */
function getFirstEnabledDrawMode(
  enabledButtons: Props["enabledButtons"],
  showPoint: boolean,
  showLine: boolean,
  showPolygon: boolean,
) {
  for (const m of DRAW_MODES_ORDER) {
    switch (m) {
      case "point":
        if (showPoint && enabledButtons.point) return m
        break
      case "linestring":
        if (showLine && enabledButtons.linestring) return m
        break
      case "freehand-linestring":
        if (showLine && enabledButtons["freehand-linestring"]) return m
        break
      case "polygon":
        if (showPolygon && enabledButtons.polygon) return m
        break
    }
  }
  return "linestring"
}

const groupWrapperClass =
  "flex overflow-hidden rounded-md border border-gray-300 divide-x divide-gray-300"

const groupButtonClass = (isActive: boolean, isDisabled: boolean) =>
  clsx(
    "flex items-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors",
    isActive
      ? "cursor-default bg-blue-600 text-white"
      : isDisabled
        ? "cursor-not-allowed bg-gray-100 text-gray-400"
        : "cursor-pointer bg-white text-gray-700 hover:bg-gray-50",
  )

/**
 * Toolbar for switching between drawing modes in Terra Draw
 */
export const TerraDrawToolbar = ({
  mode,
  setMode,
  onClear,
  deleteSelected,
  selectedIds,
  hasGeometries,
  showPoint,
  showLine,
  showPolygon,
  enabledButtons,
  trailingButtons,
}: Props) => {
  const hasSelection = selectedIds.length > 0
  const deleteButtonTitle = hasSelection ? "Ausgewähltes Element löschen" : "Alle Elemente löschen"

  const isDrawModeActive = mode !== "select"
  const firstDrawMode = getFirstEnabledDrawMode(enabledButtons, showPoint, showLine, showPolygon)

  /** Stift to show as active: current mode when drawing, or geometry type when editing. Null only when select + no geometries (e.g. briefly after clear). */
  const effectiveStiftMode: TerraDrawDrawMode | null = isDrawModeActive
    ? mode
    : hasGeometries
      ? getDisplayDrawModeFromEnabled(enabledButtons)
      : null

  const handleDelete = () => {
    if (hasSelection && deleteSelected) {
      deleteSelected()
    } else if (onClear) {
      onClear()
      const targetMode = isDrawModeActive
        ? mode
        : getFirstEnabledDrawMode(
            {
              point: true,
              linestring: true,
              "freehand-linestring": true,
              polygon: true,
              edit: false,
            },
            showPoint,
            showLine,
            showPolygon,
          )
      setMode(targetMode)
    }
  }

  const handlePlusClick = () => {
    if (firstDrawMode) setMode(firstDrawMode)
  }

  const stiftButtons: {
    mode: TerraDrawDrawMode
    label: string
    title: string
    icon: React.ReactNode
  }[] = []
  if (showPoint) {
    stiftButtons.push({
      mode: "point",
      label: "Punkt",
      title: enabledButtons.point
        ? "Punkt zeichnen"
        : "Deaktiviert - andere Geometrietypen vorhanden",
      icon: <GeometryIcon type="POINT" className="size-4 shrink-0" />,
    })
  }
  if (showLine) {
    stiftButtons.push({
      mode: "linestring",
      label: "Linie",
      title: enabledButtons.linestring
        ? "Linie zeichnen"
        : "Deaktiviert - andere Geometrietypen vorhanden",
      icon: <GeometryIcon type="LINE" className="size-4 shrink-0" />,
    })
    stiftButtons.push({
      mode: "freehand-linestring",
      label: "Freihand",
      title: enabledButtons["freehand-linestring"]
        ? "Freihand-Linie zeichnen"
        : "Deaktiviert - andere Geometrietypen vorhanden",
      icon: <LineSquiggle className="size-4 shrink-0" />,
    })
  }
  if (showPolygon) {
    stiftButtons.push({
      mode: "polygon",
      label: "Fläche",
      title: enabledButtons.polygon
        ? "Fläche zeichnen"
        : "Deaktiviert - andere Geometrietypen vorhanden",
      icon: <GeometryIcon type="POLYGON" className="size-4 shrink-0" />,
    })
  }

  return (
    <div className="flex w-max flex-wrap items-center gap-3 rounded-md bg-white p-2 shadow-md">
      {/* Stift */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-700">Stift:</span>
        <div className={groupWrapperClass}>
          {stiftButtons.map((btn) => {
            const isActive = effectiveStiftMode === btn.mode
            const isDisabled = !enabledButtons[btn.mode]
            return (
              <button
                key={btn.mode}
                type="button"
                onClick={() => !isDisabled && setMode(btn.mode)}
                className={groupButtonClass(isActive, isDisabled)}
                title={btn.title}
                disabled={isDisabled}
              >
                {btn.icon}
                {isActive && <span>{btn.label}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Aktion */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-700">Aktion:</span>
        <div className={groupWrapperClass}>
          <button
            type="button"
            onClick={handlePlusClick}
            className={groupButtonClass(isDrawModeActive, !firstDrawMode)}
            title={firstDrawMode ? "Zeichnen" : "Deaktiviert - andere Geometrietypen vorhanden"}
            disabled={!firstDrawMode}
          >
            <PlusIcon className="size-4 shrink-0" />
            {isDrawModeActive && <span>Zeichnen</span>}
          </button>
          <button
            type="button"
            onClick={() => enabledButtons.edit && setMode("select")}
            className={groupButtonClass(mode === "select", !enabledButtons.edit)}
            title={
              enabledButtons.edit ? "Ändern/Auswählen" : "Deaktiviert - keine Geometrien vorhanden"
            }
            disabled={!enabledButtons.edit}
          >
            <PencilIcon className="size-4 shrink-0" />
            {mode === "select" && <span>Ändern</span>}
          </button>
        </div>
      </div>

      {(onClear || deleteSelected) && (
        <>
          <Divider />
          <button
            type="button"
            onClick={handleDelete}
            disabled={!hasGeometries}
            className={twMerge(
              "flex items-center justify-center rounded-md border border-gray-300 p-2 text-sm font-medium transition-colors",
              !hasGeometries
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "cursor-pointer bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700",
            )}
            title={deleteButtonTitle}
          >
            <TrashIcon className="size-4" />
          </button>
        </>
      )}

      {trailingButtons}
    </div>
  )
}
