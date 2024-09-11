import { useUserCan } from "../hooks/useUserCan"

const BORDER = false

type Props = {
  children: React.ReactNode
}

export const Border = ({ children }: Props) => {
  return BORDER ? <div className="border-4 border-red-500">{children}</div> : children
}

export const IfUserCanView = ({ children }: Props) => {
  return useUserCan().view ? <Border>{children}</Border> : null
}

export const IfUserCanEdit = ({ children }: Props) => {
  return useUserCan().edit ? <Border>{children}</Border> : null
}
