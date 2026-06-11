import type { MembershipRoleEnum, UserRoleEnum } from "@/src/prisma/generated/browser"

export type CurrentUser = {
  email: string
  firstName: string | null
  id: number
  institution: string | null
  lastName: string | null
  memberships: {
    project: { slug: string }
    role: MembershipRoleEnum
  }[]
  phone: string | null
  role: UserRoleEnum
}
