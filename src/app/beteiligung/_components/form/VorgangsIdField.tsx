import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { Description, Field, Input, Label } from "@headlessui/react"
import { useEffect } from "react"
import { useFieldContext } from "../../_shared/hooks/form-context"

type VorgangsIdFieldProps = {
  description?: string
  required: boolean
  label: string
  vorgangsId?: string
}

export const SurveyVorgangsIdField = ({
  description,
  label,
  required,
  vorgangsId,
}: VorgangsIdFieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  useEffect(() => {
    if (vorgangsId && field.state.value !== vorgangsId) {
      field.setValue(vorgangsId)
    }
  }, [field, vorgangsId])

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <Field>
        <div className="mb-4">
          <Label className={formClasses.fieldLabel}>
            {label} {!required && "(optional)"}
          </Label>
          <Description className={formClasses.fieldDescription}>{description}</Description>
        </div>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          readOnly
          className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-200 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-(--survey-primary-color) focus:ring-(--survey-primary-color) focus:outline-hidden sm:text-sm"
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
