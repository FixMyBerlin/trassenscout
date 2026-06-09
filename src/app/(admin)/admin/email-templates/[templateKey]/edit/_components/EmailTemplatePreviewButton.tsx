"use client"

import { useCoreAppFormContext } from "@/src/core/components/forms/hooks/formContext"
import { blueButtonStyles } from "@/src/core/components/links"
import { EmailTemplateFormValues } from "@/src/server/emailTemplates/schema"

type Props = {
  onPreview: (values: EmailTemplateFormValues) => Promise<void>
  disabled?: boolean
}

export const EmailTemplatePreviewButton = ({ onPreview, disabled }: Props) => {
  const form = useCoreAppFormContext<EmailTemplateFormValues>()

  return (
    <button
      type="button"
      className={blueButtonStyles}
      disabled={disabled}
      onClick={() => onPreview(form.state.values as unknown as EmailTemplateFormValues)}
    >
      Preview aktualisieren
    </button>
  )
}
