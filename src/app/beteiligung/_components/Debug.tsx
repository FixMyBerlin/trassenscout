import { isDev } from "@/src/core/utils"

type Props = {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLDivElement>

export const Debug = ({ children, ...props }: Props) => {
  if (isDev) return <div {...props}>{children}</div>
  return null
}
