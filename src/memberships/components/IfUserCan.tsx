import React from "react"
import { useUserCan } from "../hooks/useUserCan"

const BORDER = false

type Props = {
  children: React.ReactNode
}

export const Border: React.FC<Props> = ({ children }) => {
  return BORDER ? <div className="border-4 border-red-500">{children}</div> : children
}

export const IfUserCanView: React.FC<Props> = ({ children }) => {
  return useUserCan().view ? <Border>{children}</Border> : null
}

export const IfUserCanEdit: React.FC<Props> = ({ children }) => {
  return useUserCan().edit ? <Border>{children}</Border> : null
}
