import React, { Suspense } from "react"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { AdminBox } from "./AdminBox"

type Props = {
  className?: string
  children: React.ReactNode
}

const SuperAdminBoxQuery: React.FC<Props> = (props) => {
  const user = useCurrentUser()

  if (user?.superadmin !== true) {
    return null
  }

  return <AdminBox label="Superadmin" {...props} />
}

export const SuperAdminBox: React.FC<Props> = (props) => {
  return (
    <Suspense>
      <SuperAdminBoxQuery {...props} />
    </Suspense>
  )
}
