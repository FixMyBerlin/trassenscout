import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { MembershipUserDetails } from "@/src/components/admin/memberships/MembershipUserDetails"
import { MembershipUserInvites } from "@/src/components/admin/memberships/MembershipUserInvites"
import { UserMembershipsEditor } from "@/src/components/admin/memberships/UserMembershipsEditor"
import { getFullname } from "@/src/components/core/users/getFullname"
import { userWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"

type Props = {
  userId: number
}

export function PageAdminMembershipsUser({ userId }: Props) {
  const { data: user } = useSuspenseQuery(userWithMembershipsQueryOptions(userId))

  return (
    <>
      <AdminPageHeader
        parent={{ title: "Nutzer & Rechte", href: "/admin/memberships" }}
        title={getFullname(user) ?? user.email}
      />
      <div className="space-y-6">
        <MembershipUserDetails user={user} />
        <MembershipUserInvites invites={user.invites} />
        <UserMembershipsEditor key={userId} userId={userId} />
      </div>
    </>
  )
}
