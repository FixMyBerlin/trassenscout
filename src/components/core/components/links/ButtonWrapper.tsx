import { twJoin } from "tailwind-merge"

type Props = { className?: string; children: React.ReactNode }

export const ButtonWrapper = ({ className, children }: Props) => {
  return <div className={twJoin(className, "flex items-center gap-3")}>{children}</div>
}
