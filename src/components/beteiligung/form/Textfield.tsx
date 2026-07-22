import { Description, Field, Input, Label } from "@headlessui/react"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type TextfieldProps = {
  description?: string
  required: boolean
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const SurveyTextfield = ({
  description,
  label,
  placeholder,
  required,
  ...props
}: TextfieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

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
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          className={`block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-600 shadow-xs sm:text-sm ${formClasses.fieldFocus}`}
          {...getFieldA11yProps({ description, fieldName: field.name, hasError })}
          {...props}
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
