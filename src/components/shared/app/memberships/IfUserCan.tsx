import { NoSymbolIcon } from "@heroicons/react/20/solid"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { showMembershipRoleCheckIndicatorState } from "@/src/components/core/store/show-membership-role-check-indicator-store"
import { isProduction } from "@/src/components/core/utils/isEnv"
import { authClient } from "@/src/components/shared/auth/auth-client"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { useUserCan } from "./hooks/useUserCan"

type Props = {
  children: React.ReactNode
}

// This helps Admins to see which areas are only visible to permission holders
const AdminHint = ({ children }: Props) => {
  const { data: session } = authClient.useSession()
  if (isProduction) return children

  const showMembershipRoleCheckIndicator = showMembershipRoleCheckIndicatorState()
  if (showMembershipRoleCheckIndicator === false) return children

  if (session?.role === UserRoleEnum.ADMIN) {
    return (
      <>
        <Tooltip content="An dieser Stelle erscheint ein UI Element nur für Nutzer, die bestimmte Rechte haben.">
          <span className="m-1 inline-block rounded-sm border border-purple-300 bg-purple-100 p-1">
            <NoSymbolIcon className="size-4 text-purple-700" />
          </span>
        </Tooltip>
        {children}
      </>
    )
  }

  return children
}

export const IfUserCanEdit = ({ children }: Props) => {
  return useUserCan().edit ? <AdminHint>{children}</AdminHint> : null
}
