import { useUserCan } from "./hooks/useUserCan"

type Props = {
  children: React.ReactNode
}

export const IfUserCanEdit = ({ children }: Props) => {
  return useUserCan().edit ? <>{children}</> : null
}
