"use client"
import { isAdmin } from "@/src/pagesComponents/users/utils/isAdmin"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { Suspense } from "react"
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
