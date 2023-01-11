import React from "react"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

type Props = {
  children: React.ReactNode
}

export const AdminBox: React.FC<Props> = ({ children }) => {
  const user = useCurrentUser()

  // TODO: Change to !user.superadmin once that flag is present
  //    https://blitzjs.com/docs/authorization
  if (!user) {
    return null
  }

  return (
    <div className="my-10 rounded border border-purple-300 bg-purple-100 p-5 text-sm">
      {children}
    </div>
  )
}
