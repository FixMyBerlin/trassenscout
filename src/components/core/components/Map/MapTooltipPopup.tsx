import { twJoin, twMerge } from "tailwind-merge"
import { MapBubblePopup, type MapBubblePopupProps } from "./MapBubblePopup"
import { mapBubbleTextClassName } from "./mapBubbleStyles"

type Props = Omit<MapBubblePopupProps, "closeOnClick" | "contentRole">

/** Same padding and type scale as `TitleLabel`, so a tooltip reads like a marker label. */
const tooltipContentClassName = twJoin(
  "w-max max-w-[calc(100vw-2rem)] p-1.5 text-center whitespace-nowrap",
  mapBubbleTextClassName,
)

/**
 * Transient hover hint on a map, e.g. the id of the Verhandlungsfläche under the cursor.
 *
 * The tooltip is anchored to a point on the hovered feature (see `geometryAnchorPoint`), not to
 * the cursor — a cursor-anchored popup drifts away during `fitBounds` and on every pan. That also
 * means the bubble sits over the feature, so it MUST NOT take pointer events: otherwise the cursor
 * reaching it stops the map receiving mousemove, and the hover highlight and tooltip freeze.
 *
 * `pointer-events-none` on the popup root is not enough — maplibre's own stylesheet sets
 * `.maplibregl-popup-content { pointer-events: auto }`, so that inner wrapper has to be overridden
 * too. `anchor` stays pinned to the bottom: this bubble is small enough never to need flipping.
 */
export const MapTooltipPopup = ({
  className,
  contentClassName,
  anchor = "bottom",
  maxWidth = "none",
  ...props
}: Props) => {
  return (
    <MapBubblePopup
      {...props}
      anchor={anchor}
      maxWidth={maxWidth}
      closeOnClick={false}
      contentRole="tooltip"
      className={twMerge(
        "pointer-events-none [&_.maplibregl-popup-content]:pointer-events-none!",
        className,
      )}
      contentClassName={twMerge(tooltipContentClassName, contentClassName)}
    />
  )
}
