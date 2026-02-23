import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { Description, Field, Input, Label } from "@headlessui/react"
import { useFieldContext } from "../../_shared/hooks/form-context"

type NumberfieldProps = {
  description?: string
  required: boolean
  label: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">

export const SurveyNumberfield = ({
  description,
  label,
  placeholder,
  required,
  ...props
}: NumberfieldProps) => {
  const field = useFieldContext<number | null>()
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
        <Input
          id={field.name}
          name={field.name}
          type="number"
          value={field.state.value === null ? "" : field.state.value}
          onChange={(e) => {
            const value = e.target.value
            field.handleChange(value === "" ? null : Number(value))
          }}
          placeholder={placeholder}
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-(--survey-primary-color) focus:ring-(--survey-primary-color) focus:outline-hidden sm:text-sm"
          {...props}
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
