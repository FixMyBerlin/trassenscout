import { isDev } from "@/src/components/core/utils/isEnv"

type Props = {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLDivElement>

export const Debug = ({ children, ...props }: Props) => {
  if (isDev) return <div {...props}>{children}</div>
  return null
}
