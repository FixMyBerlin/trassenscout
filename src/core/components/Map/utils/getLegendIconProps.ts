import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"

export const getLegendIconPropsForSubsection = (subsection: TSubsections[number]) => {
  const isDashed = subsection.SubsectionStatus?.style === "DASHED"
  return {
    type: subsection.type,
    isDashed,
    color: subsectionColors.selected,
    secondColor: isDashed ? subsectionColors.dashedSecondary : undefined,
    showDots: subsection.type === "LINE",
  }
}

export const getLegendIconPropsForSubsubsection = (subsubsection: SubsubsectionWithPosition) => {
  const isDashed = subsubsection.SubsubsectionStatus?.style === "DASHED"
  return {
    type: subsubsection.type,
    isDashed,
    color: subsubsectionColors.current,
    secondColor: isDashed ? subsubsectionColors.dashedSecondary : undefined,
    showDots: subsubsection.type === "LINE",
  }
}
