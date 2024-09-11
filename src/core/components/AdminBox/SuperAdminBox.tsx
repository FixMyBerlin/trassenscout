import React, { Suspense } from "react"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { isAdmin } from "../../../users/utils/isAdmin"
import { Spinner } from "../Spinner"
import { AdminBox } from "./AdminBox"

type Props = {
  className?: string
  children: React.ReactNode
}

const SuperAdminBoxQuery: React.FC<Props> = (props) => {
  const user = useCurrentUser()

  if (!isAdmin(user)) {
    return null
  }

  return <AdminBox label="Admin" {...props} />
}

export const SuperAdminBox: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <SuperAdminBoxQuery {...props} />
    </Suspense>
  )
}
