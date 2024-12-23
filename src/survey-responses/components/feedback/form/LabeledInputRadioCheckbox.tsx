import { clsx } from "clsx"
import { CSSProperties, PropsWithoutRef } from "react"
interface LabeledInputRadioCheckboxProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  classNameLabelOverwrite?: string
  classNameItemWrapperOverwrite?: string
  classNameLabelSpan?: string
  labelSpanStyle?: CSSProperties
  label?: string
  type: "radio" | "checkbox"
}

export const LabeledInputRadioCheckbox = ({
  classNameLabelOverwrite,
  classNameItemWrapperOverwrite,
  classNameLabelSpan,
  labelSpanStyle,
  type,
  label,
  ...props
}: LabeledInputRadioCheckboxProps) => {
  return (
    <div className={classNameLabelOverwrite}>
      <label
        className={
          classNameLabelOverwrite ||
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
          <span style={labelSpanStyle} className={classNameLabelSpan}>
            {label}
          </span>
        </div>
      </label>
    </div>
  )
}
