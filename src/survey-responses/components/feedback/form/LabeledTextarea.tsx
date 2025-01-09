import { clsx } from "clsx"
import { PropsWithoutRef } from "react"

interface LabeledTextareaProps extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  help?: string
  className?: string
  classNameOverwrite?: string
}

export const LabeledTextarea = ({
  help,
  classNameOverwrite,
  className,
  ...props
}: LabeledTextareaProps) => {
  return (
    <>
      <textarea
        {...props}
        className={clsx(
          classNameOverwrite || className,
          "block h-24 w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
        )}
      />
      {help && <div className="mt-2 text-sm text-gray-500">{help}</div>}
    </>
  )
}
