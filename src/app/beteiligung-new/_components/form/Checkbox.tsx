import { FieldError } from "@/src/app/beteiligung-new/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-new/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-new/_shared/hooks/form-context"
import { Checkbox, Description, Field, Label } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"

type CheckboxProps = {
  description?: string
  label: string
  itemDescription?: string
  itemLabel: string
  className?: string
}

export const SurveyCheckbox = ({
  label,
  description,
  className,
  itemLabel,
  itemDescription,
}: CheckboxProps) => {
  const field = useFieldContext<boolean>()
  const hasError = field.state.meta.errors.length > 0
  return (
    <div className={clsx(hasError && "rounded bg-red-50", className)}>
      <p className={formClasses.fieldLabel}>{label}</p>
      {description && (
        <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
          {description}
        </p>
      )}
      <Field className="flex items-center">
        <Checkbox
          id={field.name}
          checked={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
          className="group size-6 rounded-md border bg-white/10 p-1 ring-1 ring-inset ring-white/15 data-[checked]:bg-white"
        >
          <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block" />
        </Checkbox>
        <Label className={formClasses.fieldItemLabel}>{itemLabel}</Label>
        <Description className={formClasses.fieldItemDescription}>{itemDescription}</Description>
      </Field>
      <FieldError field={field} />
    </div>
  )
}
