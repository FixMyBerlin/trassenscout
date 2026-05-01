"use client"

import { blueButtonStyles } from "@/src/core/components/links"
import { useFormContext } from "react-hook-form"
import { EmailTemplateFormValues } from "@/src/server/emailTemplates/schema"

type Props = {
  onPreview: (values: EmailTemplateFormValues) => Promise<void>
  disabled?: boolean
}

export const EmailTemplatePreviewButton = ({ onPreview, disabled }: Props) => {
  const { getValues } = useFormContext<EmailTemplateFormValues>()

  return (
    <button
      type="button"
      className={blueButtonStyles}
      disabled={disabled}
      onClick={() => onPreview(getValues())}
    >
      Preview aktualisieren
    </button>
  )
}
