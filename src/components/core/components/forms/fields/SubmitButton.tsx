import clsx from "clsx"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { useAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"

type SubmitButtonProps = {
  label: string
  className?: string
  disabled?: boolean
}

export function SubmitButton({ label, className, disabled }: SubmitButtonProps) {
  const form = useAppFormContext()
  const fieldDisabled = useFieldDisabled(disabled)

  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
      {([isSubmitting, canSubmit]) => (
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit || fieldDisabled}
          className={clsx(className || primaryButtonClassName)}
        >
          {label}
        </button>
      )}
    </form.Subscribe>
  )
}
