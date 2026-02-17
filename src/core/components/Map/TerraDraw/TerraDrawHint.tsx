import {
  terraDrawHintDismissedActions,
  terraDrawHintDismissedState,
  terraDrawModeState,
  type TerraDrawHintMode,
} from "@/src/core/store/terraDrawHintDismissed.zustand"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { TERRA_DRAW_COLORS } from "./terraDrawConfig"

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}

const HINT_BY_MODE: Partial<Record<TerraDrawHintMode, React.ReactNode>> = {
  "freehand-linestring": (
    <>Einmal in die Karte klicken um das Zeichnen zu starten. Der zweite Klick beendet die Linie.</>
  ),
  linestring: (
    <>Jeder Klick in die Karte markiert Linien-Knoten. Zum Beenden Doppelklick (oder ESC).</>
  ),
  polygon: (
    <>Jeder Klick in die Karte markiert Flächen-Knoten. Zum Beenden Doppelklick (oder ESC).</>
  ),
  select: (
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
  ),
}

export const TerraDrawHint = () => {
  const mode = terraDrawModeState()
  const dismissedModes = terraDrawHintDismissedState()
  const { dismissTerraDrawHint } = terraDrawHintDismissedActions()

  if (mode === null) return null
  if (dismissedModes.has(mode)) return null

  const content = HINT_BY_MODE[mode]
  if (content == null) return null

  return (
    <div
      className="mr-4 flex items-start gap-2 rounded-md bg-gray-800 px-2 py-1.5 text-sm text-white"
      role="status"
    >
      <span className="min-w-0 flex-1">{content}</span>
      <button
        type="button"
        onClick={() => dismissTerraDrawHint(mode)}
        className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-gray-700 hover:text-white"
        aria-label="Hinweis heute nicht mehr anzeigen"
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  )
}
