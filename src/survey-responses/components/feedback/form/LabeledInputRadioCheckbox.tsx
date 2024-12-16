import { clsx } from "clsx"
import { PropsWithoutRef } from "react"
interface LabeledInputRadioCheckboxProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  classLabelOverwrite?: string
  classNameItemWrapperOverwrite?: string
  label?: string
  type: "radio" | "checkbox"
}

export const LabeledInputRadioCheckbox = ({
  classLabelOverwrite,
  classNameItemWrapperOverwrite,
  type,
  label,
  ...props
}: LabeledInputRadioCheckboxProps) => {
  return (
    <div className={clsx(classLabelOverwrite)}>
      <label
        className={
          classLabelOverwrite ||
          "gray-700 block text-sm font-medium leading-none lg:whitespace-nowrap"
        }
      >
        <div
          className={clsx(
            classNameItemWrapperOverwrite || "flex h-5 items-center justify-start",
            "cursor-pointer",
          )}
        >
          <input
            type={type}
            {...props}
            className={clsx(
              type === "checkbox" && "rounded-sm",
              "mr-2 h-4 w-4 cursor-pointer border-gray-300 leading-none text-blue-500 focus:ring-blue-500",
            )}
          />
          {label}
        </div>
      </label>
    </div>
  )
}
