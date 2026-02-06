import { layerColors } from "@/src/core/components/Map/layerColors"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"

export const getLegendIconPropsForSubsection = (subsection: TSubsections[number]) => {
  const isDashed = subsection.SubsectionStatus?.style === "DASHED"
  return {
    type: subsection.type,
    isDashed,
    color: layerColors.selectable,
    secondColor: isDashed ? layerColors.dashedSubsectionSecondary : undefined,
    showDots: subsection.type === "LINE",
  }
}

export const getLegendIconPropsForSubsubsection = (subsubsection: SubsubsectionWithPosition) => {
  const isDashed = subsubsection.SubsubsectionStatus?.style === "DASHED"
  return {
    type: subsubsection.type,
    isDashed,
    color: layerColors.entryDefault,
    secondColor: isDashed ? layerColors.dashedEntrySecondary : undefined,
    showDots: subsubsection.type === "LINE",
  }
}
