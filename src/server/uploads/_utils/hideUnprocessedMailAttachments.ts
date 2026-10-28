import type { MembershipRoleEnum } from "@/src/prisma/generated/browser"

export function hideUnprocessedMailAttachments(membershipRole: MembershipRoleEnum | null) {
  if (membershipRole === null) return {}

  return { NOT: { projectRecordEmailId: { not: null }, projectRecords: { none: {} } } }
}
