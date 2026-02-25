import { SubsectionStatusStyleEnum, SubsubsectionStatusStyleEnum } from "@prisma/client"

export const subsectionStatusStyleTranslations: Record<SubsectionStatusStyleEnum, string> = {
  [SubsectionStatusStyleEnum.REGULAR]: "Standard",
  [SubsectionStatusStyleEnum.DASHED]: "Gestrichelt",
}

export const subsubsectionStatusStyleTranslations: Record<SubsubsectionStatusStyleEnum, string> = {
  [SubsubsectionStatusStyleEnum.REGULAR]: "Standard",
  [SubsubsectionStatusStyleEnum.GREEN]: "Grün",
}
