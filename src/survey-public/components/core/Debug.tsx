import { isDev } from "@/src/core/utils"

type Props = {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLDivElement>

export const Debug: React.FC<Props> = ({ children, ...props }) => {
  if (isDev) return <div {...props}>{children}</div>
  return null
}
