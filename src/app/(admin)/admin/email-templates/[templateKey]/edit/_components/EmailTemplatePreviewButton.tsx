"use client"

import { blueButtonStyles } from "@/src/core/components/links"
import { EmailTemplateFormValues } from "@/src/server/emailTemplates/schema"
import { useFormContext } from "react-hook-form"

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
