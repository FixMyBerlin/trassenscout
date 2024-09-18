import { forwardRef, PropsWithoutRef } from "react"
import { useFormContext } from "react-hook-form"

export interface HiddenFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
}

export const HiddenField = forwardRef<HTMLInputElement, HiddenFieldProps>(
  ({ name, ...props }, ref) => {
    const { register } = useFormContext()

    return <input readOnly={true} type="hidden" {...register(name)} id={name} {...props} />
  },
)
