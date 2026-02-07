import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { GeometryTypeEnum } from "@prisma/client"
import { clsx } from "clsx"

type Props = {
  type: GeometryTypeEnum
  isDashed?: boolean
  color: string
  secondColor?: string
  showDots?: boolean
  dottedBorder?: boolean
  className?: string
}

const LegendDots = () => (
  <>
    <span
      className="absolute top-1/2 z-10 size-2.5 -translate-y-1/2 rounded-full"
      style={{ backgroundColor: subsectionColors.lineDotSelected }}
    />
    <span
      className="absolute top-1/2 left-6 z-10 size-2.5 -translate-y-1/2 rounded-full"
      style={{ backgroundColor: subsectionColors.lineDotSelected }}
    />
  </>
)

export const LegendIcon = ({
  type,
  isDashed = false,
  color,
  secondColor,
  showDots = false,
  dottedBorder = false,
  className,
}: Props) => {
  switch (type) {
    case "LINE":
      if (isDashed) {
        return (
          <span className={clsx("relative h-2.5 w-8", className)}>
            {showDots && <LegendDots />}
            <span
              className="absolute top-1/2 h-2 w-8 -translate-y-1/2 rounded"
              style={{ backgroundColor: color }}
            />
            <span
              className="absolute top-1/2 h-2 w-1 -translate-y-1/2 rounded-l"
              style={{ backgroundColor: secondColor || subsubsectionColors.dashedSecondary }}
            />
            <span
              className="absolute top-1/2 left-2.5 h-2 w-1 -translate-y-1/2"
              style={{ backgroundColor: secondColor || subsubsectionColors.dashedSecondary }}
            />
            <span
              className="absolute top-1/2 left-5 h-2 w-1 -translate-y-1/2"
              style={{ backgroundColor: secondColor || subsubsectionColors.dashedSecondary }}
            />
          </span>
        )
      }

      return (
        <span className={clsx("relative h-2.5 w-8", className)}>
          {showDots && <LegendDots />}
          <span
            className="absolute top-1/2 h-2 w-8 -translate-y-1/2 rounded-sm border border-gray-500 bg-blue-500"
            style={{ backgroundColor: color }}
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
            className={clsx(
              "absolute inline-block size-[18px] rounded",
              dottedBorder ? "border border-dashed" : "border-2",
            )}
            style={{ borderColor: color, backgroundColor: `${color}30` }}
          />
        </span>
      )
  }
}
