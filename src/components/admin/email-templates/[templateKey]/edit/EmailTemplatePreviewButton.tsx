import { useStore } from "@tanstack/react-form"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { EmailTemplateFormValues } from "@/src/shared/emailTemplates/schemas"

type Props = {
  onPreview: (values: EmailTemplateFormValues) => Promise<void>
  disabled?: boolean
}

export const EmailTemplatePreviewButton = ({ onPreview, disabled }: Props) => {
  const form = useCoreAppFormContext<EmailTemplateFormValues>()
  const values = useStore(form.store, (state) => state.values)

  return (
    <button
      type="button"
      className={primaryButtonClassName}
      disabled={disabled}
      onClick={() => onPreview(values)}
    >
      Preview aktualisieren
    </button>
  )
}
