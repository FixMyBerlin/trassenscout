import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { Description, Field, Input, Label } from "@headlessui/react"
import { useEffect } from "react"
import { useFieldContext } from "../../_shared/hooks/form-context"

type ResponseIdFieldProps = {
  description?: string
  required: boolean
  label: string
  surveyResponseId?: number
  prefix?: string
}

export const SurveyResponseIdField = ({
  description,
  label,
  required,
  surveyResponseId,
  prefix,
}: ResponseIdFieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  useEffect(() => {
    if (surveyResponseId !== undefined) {
      const idValue = prefix ? `${prefix}-${surveyResponseId}` : String(surveyResponseId)
      if (field.state.value !== idValue) {
        field.setValue(idValue)
      }
    }
  }, [field, surveyResponseId, prefix])

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
