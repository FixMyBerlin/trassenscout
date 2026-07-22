import { Description, Field, Input, Label } from "@headlessui/react"
import { useEffect } from "react"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

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
          {description && (
            <Description
              id={getFieldDescriptionId(field.name)}
              className={formClasses.fieldDescription}
            >
              {description}
            </Description>
          )}
        </div>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          readOnly
          className={`block w-full appearance-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 placeholder-gray-600 shadow-xs sm:text-sm ${formClasses.fieldFocus}`}
          {...getFieldA11yProps({ description, fieldName: field.name, hasError })}
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
