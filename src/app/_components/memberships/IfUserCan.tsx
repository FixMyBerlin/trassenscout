// This is a copy of /src/pagesComponents/memberships/IfUserCan.tsx
// The only difference is that it uses useUserCan from "./hooks/useUserCan"
// which internally uses the app directory version of useProjectSlug

"use client"

import { showMembershipRoleCheckIndicatorState } from "@/src/core/store/showMembershipRoleCheckIndicator.zustand"
import { isProduction } from "@/src/core/utils"
import { useSession } from "@blitzjs/auth"
import { NoSymbolIcon } from "@heroicons/react/20/solid"
import { useUserCan } from "./hooks/useUserCan"

type Props = {
  children: React.ReactNode
}

// This helps Admins to see which areas are only visible to permission holders
export const AdminHint = ({ children }: Props) => {
  const session = useSession()
  if (isProduction) return children

  const showMembershipRoleCheckIndicator = showMembershipRoleCheckIndicatorState()
  if (showMembershipRoleCheckIndicator === false) return children

  if (session.role === "ADMIN") {
    return (
      <>
        <span
          className="m-1 inline-block rounded border border-purple-300 bg-purple-100 p-1"
          title="An dieser Stelle erscheint ein UI Element nur für Nutzer, die bestimmte Rechte haben."
        >
          <NoSymbolIcon className="h-4 w-4 text-purple-700" />
        </span>
        {children}
      </>
    )
  }

  return children
}

// export const IfUserCanView = ({ children }: Props) => {
//   return useUserCan().view ? <AdminHint>{children}</AdminHint> : null
// }

export const IfUserCanEdit = ({ children }: Props) => {
  return useUserCan().edit ? <AdminHint>{children}</AdminHint> : null
}
