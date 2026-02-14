import { GeometryTypeEnum } from "@prisma/client"
import { clsx } from "clsx"

type Props = {
  type: GeometryTypeEnum
  isDashed?: boolean
  color: string
  secondColor?: string
  showDots?: boolean
  dotsColor?: string
  lineWidth?: number
  borderWidth?: number
  borderStyle?: "solid" | "dashed"
  className?: string
}

const LegendDots = ({ color }: { color: string }) => (
  <>
    <span
      className="absolute top-1/2 z-10 size-2.5 -translate-y-1/2 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span
      className="absolute top-1/2 left-6 z-10 size-2.5 -translate-y-1/2 rounded-full"
      style={{ backgroundColor: color }}
    />
  </>
)

export const LegendIcon = ({
  type,
  isDashed = false,
  color,
  secondColor,
  showDots = false,
  dotsColor,
  lineWidth,
  borderWidth,
  borderStyle,
  className,
}: Props) => {
  const lineContainerHeight = lineWidth != null ? Math.max(lineWidth + 2, 10) : undefined

  switch (type) {
    case "LINE":
      if (isDashed) {
        return (
          <span className={clsx("relative w-8", className)} style={{ height: lineContainerHeight }}>
            {showDots && dotsColor != null && <LegendDots color={dotsColor} />}
            <span
              className="absolute top-1/2 w-8 -translate-y-1/2 rounded"
              style={{ height: lineWidth, backgroundColor: color }}
            />
            <span
              className="absolute top-1/2 w-1 -translate-y-1/2 rounded-l"
              style={{ height: lineWidth, backgroundColor: secondColor }}
            />
            <span
              className="absolute top-1/2 left-2.5 w-1 -translate-y-1/2"
              style={{ height: lineWidth, backgroundColor: secondColor }}
            />
            <span
              className="absolute top-1/2 left-5 w-1 -translate-y-1/2"
              style={{ height: lineWidth, backgroundColor: secondColor }}
            />
          </span>
        )
      }

      return (
        <span className={clsx("relative w-8", className)} style={{ height: lineContainerHeight }}>
          {showDots && dotsColor != null && <LegendDots color={dotsColor} />}
          <span
            className="absolute top-1/2 w-8 -translate-y-1/2 rounded-sm border border-gray-500"
            style={{ height: lineWidth, backgroundColor: color }}
          />
        </span>
      )

    case "POINT":
      return (
        <span className={clsx("relative size-[18px] shrink-0", className)}>
          <span
            className="absolute inline-block size-[18px] rounded-full border-2"
            style={{ borderColor: color }}
          />
          <span
            className="absolute inline-block size-[18px] rounded-full opacity-20"
            style={{ backgroundColor: color }}
          />
        </span>
      )

    case "POLYGON":
      return (
        <span className={clsx("relative size-[18px] shrink-0", className)}>
          <span
            className="absolute inline-block size-[18px]"
            style={{
              borderColor: color,
              backgroundColor: `${color}30`,
              borderWidth: `${borderWidth}px`,
              borderStyle: borderStyle === "dashed" ? "dashed" : "solid",
            }}
          />
        </span>
      )
  }
}
