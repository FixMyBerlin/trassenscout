import { FieldWithErrorContainer } from "@/src/app/beteiligung-neu/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung-neu/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-neu/_components/form/styles"
import { Description, Field, Input, Label } from "@headlessui/react"
import { useFieldContext } from "../../_shared/hooks/form-context"

type TextfieldProps = {
  description?: string
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const SurveyTextfield = ({ description, label, placeholder, ...props }: TextfieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <FieldError field={field} />
      <Field>
        <div className="mb-4">
          <Label className={formClasses.fieldLabel}>{label}</Label>
          <Description className={formClasses.fieldDescription}>{description}</Description>
        </div>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[var(--survey-primary-color)] focus:outline-none focus:ring-[var(--survey-primary-color)] sm:text-sm"
          {...props}
        />
      </Field>
    </FieldWithErrorContainer>
  )
}
