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

const pathProps = { stroke: "#999", strokeWidth: "1", fill: "white" }
const pathCorner = <path d="M 11 16 L 0 0 L 16 11" {...pathProps} />
const pathSide = <path d="M 0 15 L 5 0 L 10 15" {...pathProps} />

const tipElements = {
  bottomRight: createSvg({ top: 0, left: 0 }, 0, pathCorner),
  bottom: createSvg({ top: 0, left: -5 }, 0, pathSide),
  bottomLeft: createSvg({ top: 0, left: 0 }, 90, pathCorner),
  left: createSvg({ top: -5, left: 0 }, 90, pathSide),
  topLeft: createSvg({ top: 0, left: 0 }, 180, pathCorner),
  top: createSvg({ top: 0, left: 5 }, 180, pathSide),
  topRight: createSvg({ top: 0, left: 0 }, 270, pathCorner),
  right: createSvg({ top: 5, left: 0 }, 270, pathSide),
}

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
          isHighlighted ? "border-yellow-400" : "",
          pillClassName,
        )}
      >
        {children}
      </div>
      {tipElements[anchor]}
    </div>
  )
}
