import { Description, Field, Label, Textarea } from "@headlessui/react"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import { FieldError } from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type TextfieldProps = {
  description?: string
  required: boolean
  label: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const SurveyTextarea = ({
  description,
  label,
  className: _className,
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
          <Description className={formClasses.fieldDescription}>{description}</Description>
        </div>
        <Textarea
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          rows={6}
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-(--survey-primary-color) focus:ring-(--survey-primary-color) focus:outline-hidden"
          {...props}
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
