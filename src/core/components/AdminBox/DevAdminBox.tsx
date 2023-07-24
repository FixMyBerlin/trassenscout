import React from "react"
import { AdminBox } from "./AdminBox"
import { isDev } from "src/core/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

export const DevAdminBox: React.FC<Props> = (props) => {
  if (!isDev) {
    return null
  }

  return <AdminBox label="Dev" {...props} />
}
