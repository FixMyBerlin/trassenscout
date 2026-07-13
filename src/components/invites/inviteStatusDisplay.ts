import { InviteStatusEnum } from "@/src/prisma/generated/browser"

export const inviteStatusLabels: Record<InviteStatusEnum, string> = {
  [InviteStatusEnum.PENDING]: "Ausstehend",
  [InviteStatusEnum.ACCEPTED]: "Akzeptiert",
  [InviteStatusEnum.EXPIRED]: "Abgelaufen",
}

export const inviteStatusClassNames: Record<InviteStatusEnum, string> = {
  [InviteStatusEnum.PENDING]: "text-yellow-700 bg-yellow-100",
  [InviteStatusEnum.ACCEPTED]: "text-green-700 bg-green-100",
  [InviteStatusEnum.EXPIRED]: "text-indigo-700 bg-indigo-100",
}
