import { FieldError } from "@/src/app/beteiligung-neu/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-neu/_components/form/styles"
import { Description, Field, Label, Textarea } from "@headlessui/react"
import clsx from "clsx"
import { useFieldContext } from "../../_shared/hooks/form-context"

type TextfieldProps = {
  description?: string
  label: string
  className?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>
// todo types headless ui...

export const SurveyTextarea = ({ description, label, className, ...props }: TextfieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  // replace with healdess ui textarea
  // styling
  return (
    <div className={clsx(hasError && "rounded-xl bg-red-50", className)}>
      <FieldError field={field} />
      <Field>
        <Label className={formClasses.fieldLabel}>{label}</Label>
        <Description className={formClasses.fieldDescription}>{description}</Description>
        <Textarea
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          className={clsx(
            "mt-3 block w-full rounded-lg bg-white/5 px-3 py-1.5 text-sm/6",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
          )}
          rows={3}
        />
      </Field>
    </div>
  )
}
