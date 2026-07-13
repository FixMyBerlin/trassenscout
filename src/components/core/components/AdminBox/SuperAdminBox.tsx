import { useQuery } from "@tanstack/react-query"
import type React from "react"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { AdminBox } from "./AdminBox"

type Props = {
  className?: string
  children: React.ReactNode
}

export const SuperAdminBox = (props: Props) => {
  const { data: user } = useQuery(currentUserQueryOptions())

  if (user?.role !== UserRoleEnum.ADMIN) return null

  return <AdminBox label="Admin" {...props} />
}
