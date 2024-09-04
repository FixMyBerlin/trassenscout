import React from "react"
import { useUserCan } from "../hooks/useUserCan"

type Props = {
  children: React.ReactNode
}

export const IfUserCanView: React.FC<Props> = ({ children }) => {
  return useUserCan().view ? children : null
}

export const IfUserCanEdit: React.FC<Props> = ({ children }) => {
  return useUserCan().edit ? children : null
}
