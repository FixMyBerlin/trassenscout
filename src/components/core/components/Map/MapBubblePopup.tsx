import type React from "react"
import { Popup } from "react-map-gl/maplibre"
import { twJoin, twMerge } from "tailwind-merge"
import {
  MAP_BUBBLE_TIP_HEIGHT,
  mapBubbleClassName,
  mapBubbleShadowStyle,
  MapBubbleTip,
} from "./mapBubbleStyles"

export type MapBubblePopupProps = Omit<
  React.ComponentProps<typeof Popup>,
  "children" | "className" | "closeButton"
> & {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  contentRole?: React.AriaRole
}

/** Strips maplibre's own popup chrome so the bubble below owns the whole look. */
const popupResetClassName = twJoin(
  "z-50",
  "[&_.maplibregl-popup-content]:bg-transparent!",
  "[&_.maplibregl-popup-content]:p-0!",
  "[&_.maplibregl-popup-content]:shadow-none!",
  "[&_.maplibregl-popup-tip]:hidden!",
)

/**
 * Base for the two things that float above a map: `MapTooltipPopup` (transient hover hint)
 * and interactive detail panels. They share the bubble; they differ in pointer-events,
 * dismissal and content density — which is why they stay separate components.
 *
 * `anchor` is deliberately not defaulted: maplibre only flips the popup to keep it inside the map
 * while `anchor` is undefined, and a tall panel that cannot flip gets clipped off the map edge.
 * `MapBubbleTip` follows whichever anchor maplibre ends up using. Pin `anchor` only for small
 * bubbles that should always sit on the same side (see `MapTooltipPopup`).
 * `offset` matches the tip's height so its apex lands on the anchor coordinate.
 */
export const MapBubblePopup = ({
  children,
  className,
  contentClassName,
  contentRole,
  offset = MAP_BUBBLE_TIP_HEIGHT,
  ...props
}: MapBubblePopupProps) => {
  return (
    <Popup
      {...props}
      offset={offset}
      closeButton={false}
      className={twMerge(popupResetClassName, className)}
    >
      <div
        role={contentRole}
        style={mapBubbleShadowStyle}
        className={twMerge("relative", mapBubbleClassName, contentClassName)}
      >
        {children}
        <MapBubbleTip />
      </div>
    </Popup>
  )
}
