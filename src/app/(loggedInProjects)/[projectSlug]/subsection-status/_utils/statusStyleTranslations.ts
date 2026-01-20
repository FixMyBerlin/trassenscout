import { StatusStyleEnum } from "@prisma/client"

export const statusStyleTranslations: Record<StatusStyleEnum, string> = {
  [StatusStyleEnum.REGULAR]: "Standard",
  [StatusStyleEnum.DASHED]: "Gestrichelt",
}
