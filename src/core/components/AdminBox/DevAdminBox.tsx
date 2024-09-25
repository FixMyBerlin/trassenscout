import { isDev } from "@/src/core/utils"
import { AdminBox } from "./AdminBox"

type Props = {
  className?: string
  children: React.ReactNode
}

export const DevAdminBox = (props: Props) => {
  if (!isDev) {
    return null
  }

  return <AdminBox label="Dev" {...props} />
}
