import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { Description, Field, Label, Select } from "@headlessui/react"
import { useFieldContext } from "../../_shared/hooks/form-context"

type SelectProps = {
  description?: string
  required: boolean
  label: string
  placeholder?: string
  options: { key: string; label: string }[]
}

export const SurveySelect = ({
  description,
  label,
  options,
  placeholder,
  required,
}: SelectProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <Field>
        <div className="mb-4">
          <Label className={formClasses.fieldLabel}>
            {label} {!required && "(optional)"}
          </Label>
          <Description className={formClasses.fieldDescription}>{description}</Description>
        </div>
        <Select
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-label={label}
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[var(--survey-primary-color)] focus:outline-none focus:ring-[var(--survey-primary-color)] sm:text-sm"
        >
          {placeholder && (
            <option disabled value="">
              {placeholder || "Bitte auswählen..."}
            </option>
          )}
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
