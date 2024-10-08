import { MembershipRoleEnum, User, UserRoleEnum } from "@/db"
import { SimpleRolesIsAuthorized } from "@blitzjs/auth"

type UserRole = keyof typeof UserRoleEnum
type MembershipRole = keyof typeof MembershipRoleEnum

declare module "@blitzjs/auth" {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<UserRole>
    PublicData: {
      userId: User["id"]
      role: UserRole
      memberships: Array<{
        role: MembershipRole
        project: {
          id: number
          slug: string
        }
      }>
    }
  }
}
