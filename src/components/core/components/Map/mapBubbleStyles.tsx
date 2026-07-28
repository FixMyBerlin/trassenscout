/**
 * The one look for every bubble that floats above a map: the `TipMarker` labels on
 * Maßnahmen-/Abschnittsebene, the hover tooltip and the detail popups.
 * Anything new that hovers over the map should use these instead of re-inventing the chrome.
 */
export const mapBubbleClassName = "rounded-md border border-gray-400 bg-white"

/** Not a Tailwind shadow — kept as an inline style so `TipMarker` can merge it into its anchor styles. */
export const mapBubbleShadowStyle = { boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.25)" }

/** Matches `TitleLabel`, so a tooltip and a marker label read at the same size. */
export const mapBubbleTextClassName = "text-[14px] leading-4 text-gray-800"

/** Height of the tip, so a popup `offset` can put its apex on the anchor coordinate. */
export const MAP_BUBBLE_TIP_HEIGHT = 15

const tipPathClassName = "fill-white stroke-gray-400"

/**
 * The triangle pointing from the bubble at its anchor coordinate.
 *
 * Which one shows is decided by the `maplibregl-popup-anchor-*` class maplibre puts on the popup
 * root, so this works whether the caller pins `anchor` or lets maplibre flip the popup to keep it
 * inside the map. Corner anchors get no tip — better a tipless bubble than a clipped one.
 *
 * The paths are deliberately left open (no `Z`): the fill closes them, so the base draws no stroke
 * and can overlap the bubble's border without a seam.
 */
export const MapBubbleTip = () => {
  return (
    <>
      <svg
        width="12"
        height="16"
        viewBox="0 0 12 16"
        aria-hidden
        className="absolute top-full left-1/2 hidden -translate-x-1/2 -translate-y-px [.maplibregl-popup-anchor-bottom_&]:block"
      >
        <path d="M 1 0 L 6 15 L 11 0" strokeWidth="1" className={tipPathClassName} />
      </svg>
      <svg
        width="12"
        height="16"
        viewBox="0 0 12 16"
        aria-hidden
        className="absolute bottom-full left-1/2 hidden -translate-x-1/2 translate-y-px [.maplibregl-popup-anchor-top_&]:block"
      >
        <path d="M 1 16 L 6 1 L 11 16" strokeWidth="1" className={tipPathClassName} />
      </svg>
    </>
  )
}
