import clsx from "clsx"
import React from "react"

type Props = {
  label: "Dev" | "Admin"
  className?: string
  children: React.ReactNode
}

export const AdminBox: React.FC<Props> = ({ label, className, children }) => {
  return (
    <div
      className={clsx(
        className,
        "border-purple-300 bg-purple-100 relative my-10 rounded border p-5 text-sm"
      )}
    >
      <div className="absolute -top-2 right-1 space-x-1 text-[10px] uppercase leading-none">
        <span className="border-purple-400 bg-purple-100 text-purple-500 inline-flex items-center justify-center rounded-xl border px-1 pt-0.5">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
