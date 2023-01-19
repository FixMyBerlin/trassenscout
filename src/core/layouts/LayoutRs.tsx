import React from "react"
import { NavigationProject } from "./Navigation/NavigationProject/NavigationProject"

type Props = {
  children?: React.ReactNode
}

export const LayoutRs: React.FC<Props> = ({ children }) => {
  return (
    <div className="text-dark-gray relative flex h-full flex-col overflow-x-hidden">
      <NavigationProject />
      <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
    </div>
  )
}
