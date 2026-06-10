import type React from "react"
import { AdminBox } from "./AdminBox"

type Props = {
  className?: string
  children: React.ReactNode
}

export const SuperAdminBox = (props: Props) => {
  return <AdminBox label="Admin" {...props} />
}
