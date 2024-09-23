"use client"
import { useCurrentUser } from "@/src/users/hooks/useCurrentUser"
import { Suspense } from "react"
import { isAdmin } from "../../../users/utils/isAdmin"
import { Spinner } from "../Spinner"
import { AdminBox } from "./AdminBox"

type Props = {
  className?: string
  children: React.ReactNode
}

const SuperAdminBoxQuery = (props: Props) => {
  const user = useCurrentUser()

  if (!isAdmin(user)) {
    return null
  }

  return <AdminBox label="Admin" {...props} />
}

export const SuperAdminBox = (props: Props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <SuperAdminBoxQuery {...props} />
    </Suspense>
  )
}
