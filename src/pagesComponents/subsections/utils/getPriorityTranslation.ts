import { PriorityEnum } from "@prisma/client"

export const getPriorityTranslation = (priority: PriorityEnum) => {
  switch (priority) {
    case PriorityEnum.TOP:
      return "Sehr hoch"
    case PriorityEnum.HIGH:
      return "Hoch"
    case PriorityEnum.MEDIUM:
      return "Mittel"
    case PriorityEnum.LOW:
      return "Niedrig"
    case PriorityEnum.OPEN:
      return "Priorität offen"
    default:
      return "Priorität offen"
  }
}
