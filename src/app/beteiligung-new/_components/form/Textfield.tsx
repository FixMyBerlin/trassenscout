import { FieldError } from "@/src/app/beteiligung-new/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-new/_components/form/styles"
import { Description, Field, Input, Label } from "@headlessui/react"
import clsx from "clsx"
import { useFieldContext } from "../../_shared/hooks/form-context"

type TextfieldProps = {
  description?: string
  label: string
  className?: string
}

export const SurveyTextfield = ({ description, label, className }: TextfieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <div className={clsx(hasError && "rounded-xl bg-red-50", className)}>
      <FieldError field={field} />
      <Field>
        <Label className={formClasses.fieldLabel}>{label}</Label>
        <Description className={formClasses.fieldDescription}>{description}</Description>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          className={clsx(
            "mt-3 block w-full rounded-lg px-3 py-1.5 text-sm/6",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
          )}
        />
      </Field>
    </div>
  )
}
