import { clsx } from "clsx"

type Props = {
  label: "Dev" | "Admin"
  className?: string
  compact?: boolean
  children: React.ReactNode
}

export const AdminBox = ({ label, className, compact = false, children }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "relative flex flex-col rounded-sm border border-purple-300 bg-purple-100",
        compact ? "my-2 gap-2 p-2 text-xs" : "my-10 gap-8 p-5 text-sm",
      )}
    >
      <div
        className={clsx(
          "absolute right-1 space-x-1 leading-none uppercase",
          compact ? "-top-1.5 text-[9px]" : "-top-2 text-[10px]",
        )}
      >
        <span
          className={clsx(
            "inline-flex items-center justify-center border border-purple-400 bg-purple-100 text-purple-500",
            compact ? "rounded-md px-1" : "rounded-xl",
          )}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
