import type { MembershipRoleEnum } from "@/src/prisma/generated/browser"

export const roleTranslation: Record<MembershipRoleEnum, string> = {
  VIEWER: "Leserechte",
  EDITOR: "Bearbeitungsrechte",
}
