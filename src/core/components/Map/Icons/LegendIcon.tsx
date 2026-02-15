import { legendIconRegistry, type LegendIconId } from "@/src/core/components/Map/legendIconRegistry"
import { clsx } from "clsx"

type Props = {
  iconId: LegendIconId
  className?: string
}

export const LegendIcon = ({ iconId, className }: Props) => {
  const props = legendIconRegistry[iconId]

  switch (props.type) {
    case "LINE": {
      const lineWidth = "lineWidth" in props ? (props.lineWidth ?? 7) : 7
      const lineContainerHeight = Math.max(lineWidth + 2, 10)
      const isDashed = "isDashed" in props && props.isDashed === true

      if (isDashed) {
        return (
          <span className={clsx("relative w-8", className)} style={{ height: lineContainerHeight }}>
            <span
              className="absolute top-1/2 w-8 -translate-y-1/2 rounded"
              style={{
                height: lineWidth,
                backgroundColor: props.color,
              }}
            />
            <span
              className="absolute top-1/2 w-1 -translate-y-1/2 rounded-l"
              style={{
                height: lineWidth,
                backgroundColor: props.secondColor,
              }}
            />
            <span
              className="absolute top-1/2 left-2.5 w-1 -translate-y-1/2"
              style={{
                height: lineWidth,
                backgroundColor: props.secondColor,
              }}
            />
            <span
              className="absolute top-1/2 left-5 w-1 -translate-y-1/2"
              style={{
                height: lineWidth,
                backgroundColor: props.secondColor,
              }}
            />
          </span>
        )
      }

      return (
        <span className={clsx("relative w-8", className)} style={{ height: lineContainerHeight }}>
          <span
            className="absolute top-1/2 w-8 -translate-y-1/2 rounded-sm border border-gray-500"
            style={{
              height: lineWidth,
              backgroundColor: props.color,
            }}
          />
        </span>
      )
    }

    case "POINT": {
      const borderStyle =
        "borderStyle" in props && props?.borderStyle === "dashed" ? "dashed" : "solid"
      return (
        <span className={clsx("relative size-[18px] shrink-0", className)}>
          <span
            className="absolute inline-block size-[18px] rounded-full border-2"
            style={{
              borderColor: props.color,
              borderStyle,
            }}
          />
          <span
            className="absolute inline-block size-[18px] rounded-full opacity-20"
            style={{ backgroundColor: props.color }}
          />
        </span>
      )
    }

    case "POLYGON": {
      const borderStyle =
        "borderStyle" in props && props.borderStyle === "dashed" ? "dashed" : "solid"
      const borderWidth = "borderWidth" in props ? (props.borderWidth ?? 2) : 2
      return (
        <span className={clsx("relative size-[18px] shrink-0", className)}>
          <span
            className="absolute inline-block size-[18px]"
            style={{
              borderColor: props.color,
              backgroundColor: `${props.color}30`,
              borderWidth: `${borderWidth}px`,
              borderStyle,
            }}
          />
        </span>
      )
    }
  }
}
