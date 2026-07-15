import type React from "react"
import { CSSProperties } from "react"
import { twJoin } from "tailwind-merge"
import type { MapHighlightLevel } from "./mapHighlightState"
import { useMarkerHighlight } from "./useMarkerHighlight"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  anchor:
    | "bottomRight"
    | "bottom"
    | "bottomLeft"
    | "left"
    | "topLeft"
    | "top"
    | "topRight"
    | "right"
  slug: string
  highlightLevel: MapHighlightLevel
  syncHighlightOnHover?: boolean
  highlighted?: boolean
  highlightVariant?: "outline" | "filled"
  pillClassName?: string
}

const createSvg = (style: CSSProperties, rotation: number, path: React.JSX.Element) => {
  return (
    <svg
      style={{
        position: "absolute",
        width: 15,
        height: 15,
        ...(rotation ? { transform: `rotate(${rotation}deg)`, transformOrigin: "top left" } : {}),
        ...style,
      }}
    >
      {path}
    </svg>
  )
}

const createTipPath = ({ d, className }: { d: string; className: string }) => (
  <path d={d} strokeWidth="1" className={className} />
)

const shadow = {
  boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.25)",
}
const divStyles = {
  bottomRight: { ...shadow, top: 10, left: 10 },
  bottom: { ...shadow, top: 14, left: 0, transform: "translateX(-50%)" },
  bottomLeft: { ...shadow, top: 10, right: 10 },
  left: { ...shadow, top: 0, right: 14, transform: "translateY(-50%)" },
  topLeft: { ...shadow, bottom: 10, right: 10 },
  top: { ...shadow, bottom: 14, left: 0, transform: "translateX(-50%)" },
  topRight: { ...shadow, bottom: 10, left: 10 },
  right: { ...shadow, top: 0, left: 14, transform: "translateY(-50%)" },
}

export const TipMarker = ({
  className,
  anchor,
  children,
  slug,
  highlightLevel,
  syncHighlightOnHover = true,
  highlighted,
  highlightVariant = "outline",
  pillClassName,
  onMouseEnter: propsOnMouseEnter,
  onMouseLeave: propsOnMouseLeave,
  ...props
}: Props) => {
  const {
    isHighlighted: isContextHighlighted,
    handleMouseEnter: highlightMouseEnter,
    handleMouseLeave: highlightMouseLeave,
  } = useMarkerHighlight(highlightLevel, slug)
  const isHighlighted = highlighted ?? isContextHighlighted

  const bubbleClasses = twJoin(
    isHighlighted
      ? highlightVariant === "filled"
        ? "border-yellow-400 bg-yellow-400"
        : "border-yellow-400"
      : "",
  )

  const tipPathClasses = twJoin(
    "transition-colors",
    isHighlighted
      ? highlightVariant === "filled"
        ? "fill-yellow-400 stroke-yellow-400"
        : "fill-white stroke-yellow-400"
      : "fill-white stroke-gray-400",
  )

  const tipPathCorner = createTipPath({
    d: "M 11 16 L 0 0 L 16 11",
    className: tipPathClasses,
  })
  const tipPathSide = createTipPath({
    d: "M 0 15 L 5 0 L 10 15",
    className: tipPathClasses,
  })
  const tipElements = {
    bottomRight: createSvg({ top: 0, left: 0 }, 0, tipPathCorner),
    bottom: createSvg({ top: 0, left: -5 }, 0, tipPathSide),
    bottomLeft: createSvg({ top: 0, left: 0 }, 90, tipPathCorner),
    left: createSvg({ top: -5, left: 0 }, 90, tipPathSide),
    topLeft: createSvg({ top: 0, left: 0 }, 180, tipPathCorner),
    top: createSvg({ top: 0, left: 5 }, 180, tipPathSide),
    topRight: createSvg({ top: 0, left: 0 }, 270, tipPathCorner),
    right: createSvg({ top: 5, left: 0 }, 270, tipPathSide),
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (syncHighlightOnHover) highlightMouseEnter()
    propsOnMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (syncHighlightOnHover) highlightMouseLeave()
    propsOnMouseLeave?.(e)
  }

  return (
    <div
      className={twJoin("cursor-pointer whitespace-nowrap", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div
        style={divStyles[anchor]}
        className={twJoin(
          "absolute rounded-md border border-gray-400 bg-white transition-colors",
          bubbleClasses,
          pillClassName,
        )}
      >
        {children}
      </div>
      {tipElements[anchor]}
    </div>
  )
}
