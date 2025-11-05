import { clsx } from "clsx"

type Props = {
  label: "Dev" | "Admin"
  className?: string
  children: React.ReactNode
}

export const AdminBox = ({ label, className, children }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "relative my-10 rounded-sm border border-purple-300 bg-purple-100 p-5 text-sm",
      )}
    >
      <div className="absolute -top-2 right-1 space-x-1 text-[10px] leading-none uppercase">
        <span className="inline-flex items-center justify-center rounded-xl border border-purple-400 bg-purple-100 text-purple-500">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
