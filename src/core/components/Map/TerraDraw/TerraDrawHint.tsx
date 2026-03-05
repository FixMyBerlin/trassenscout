import {
  useTerraDrawHintDismiss,
  useTerraDrawHintDismissedState,
  useTerraDrawHintGeometryTypeState,
  useTerraDrawHintModeState,
} from "@/src/core/store/terraDrawHint.zustand"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { TERRA_DRAW_COLORS } from "./terraDrawConfig"
import type { TerraDrawMode } from "./useTerraDrawControl"
import { getGeometryFamily } from "./utils/featureFiltering"

function toHintKey(mode: TerraDrawMode | null, geometryType: string | null) {
  if (mode === null) return null
  switch (mode) {
    case "point":
    case "linestring":
    case "freehand-linestring":
    case "polygon":
      return { action: "add" as const, geometry: mode }
    case "select": {
      if (!geometryType) return null
      return { action: "edit" as const, geometry: getGeometryFamily(geometryType)! }
    }
  }
}

type HintAction = NonNullable<ReturnType<typeof toHintKey>>["action"]

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}

const EDIT_LINE_POLY = (
  <>
    <span className="inline-flex items-center gap-1">
      Gelbe Element <ColorDot color={TERRA_DRAW_COLORS.selectedDark} />
    </span>{" "}
    können verschoben oder geändert werden.{" "}
    <span className="inline-flex items-center gap-1">
      Pinke Punkte <ColorDot color={TERRA_DRAW_COLORS.selectionPoint} />
    </span>{" "}
    verändern die Form.{" "}
    <span className="inline-flex items-center gap-1">
      Lila Punkt <ColorDot color={TERRA_DRAW_COLORS.midPoint} />
    </span>{" "}
    erst anklicken, danach die Form verändern.
  </>
)

const SELECT_POINT = (
  <>
    <span className="inline-flex items-center gap-1">
      Blauen Punkt <ColorDot color={TERRA_DRAW_COLORS.unselected} />
    </span>{" "}
    erst anklicken und dann{" "}
    <span className="inline-flex items-center gap-1">
      gelben Punkt <ColorDot color={TERRA_DRAW_COLORS.selectedDark} />
    </span>{" "}
    verschieben.
  </>
)

const HINTS: Record<HintAction, Record<string, React.ReactNode>> = {
  add: {
    point: <>Klicken in die Karte setzt einen Punkt.</>,
    linestring: (
      <>Jeder Klick in die Karte markiert Linien-Knoten. Zum Beenden Doppelklick (oder ESC).</>
    ),
    "freehand-linestring": (
      <>
        Einmal in die Karte klicken um das Zeichnen zu starten. Der zweite Klick beendet die Linie.
      </>
    ),
    polygon: (
      <>Jeder Klick in die Karte markiert Flächen-Knoten. Zum Beenden Doppelklick (oder ESC).</>
    ),
  },
  edit: {
    point: SELECT_POINT,
    line: EDIT_LINE_POLY,
    polygon: EDIT_LINE_POLY,
  },
}

export const TerraDrawHint = () => {
  const mode = useTerraDrawHintModeState()
  const geometryType = useTerraDrawHintGeometryTypeState()
  const dismissedIds = useTerraDrawHintDismissedState()
  const dismiss = useTerraDrawHintDismiss()

  const key = toHintKey(mode, geometryType)
  if (key === null) return null

  const content = HINTS[key.action][key.geometry]
  if (content == null) return null

  const dissmissKey = `${key.action}.${key.geometry}`
  if (dismissedIds.has(dissmissKey)) return null

  return (
    <div
      className="mr-4 flex items-start gap-2 rounded-md bg-gray-800 px-2 py-1.5 text-sm text-white"
      role="status"
    >
      <span className="min-w-0 flex-1">{content}</span>
      <button
        type="button"
        onClick={() => dismiss(dissmissKey)}
        className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-gray-700 hover:text-white"
        aria-label="Hinweis heute nicht mehr anzeigen"
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  )
}
