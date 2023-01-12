import clsx from "clsx"
import React, { Suspense } from "react"
import { isDev } from "src/core/utils"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

type Props = {
  devOnly?: boolean
  className?: string
  children: React.ReactNode
}

const AdminBoxWithQuery: React.FC<Props> = ({ devOnly, className, children }) => {
  const user = useCurrentUser()

  if (user?.superadmin !== true) {
    return null
  }

  if (devOnly === true && !isDev) {
    return null
  }

  return (
    <div
      className={clsx(
        className,
        "relative my-10 rounded border border-purple-300 bg-purple-100 p-5 text-sm"
      )}
    >
      <div className="absolute -top-2 right-1 space-x-1 text-[10px] uppercase leading-none">
        <span className="inline-flex items-center justify-center rounded-xl border border-purple-400 bg-purple-100 px-1 pt-0.5 text-purple-500">
          Superadmin
        </span>
        {devOnly === true && (
          <span className="inline-flex items-center justify-center rounded-xl border border-purple-400 bg-purple-100 px-1 pt-0.5 text-purple-500">
            Dev
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export const AdminBox: React.FC<Props> = (props: Props) => {
  return (
    <Suspense>
      <AdminBoxWithQuery {...props} />
    </Suspense>
  )
}
