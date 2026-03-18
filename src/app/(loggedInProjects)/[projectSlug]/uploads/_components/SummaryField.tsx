"use client"

import { summarizeUpload } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_actions/summarizeUpload"
import { isPdf } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import type { FormApi } from "@/src/core/components/forms/types"
import { LabeledTextareaField } from "@/src/core/components/forms"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { Dispatch, SetStateAction, useState } from "react"
import { twJoin } from "tailwind-merge"

type Props = {
  form: FormApi<Record<string, unknown>>
  uploadId: number
  mimeType: string | null
  isGeneratingSummary: boolean
  setIsGeneratingSummary: Dispatch<SetStateAction<boolean>>
  isAiEnabled: boolean
  initialSummary?: string | null
}

function SummaryFieldBody({
  form,
  summaryValue,
  uploadId,
  mimeType,
  isGeneratingSummary,
  setIsGeneratingSummary,
  isAiEnabled,
}: Props & { summaryValue: unknown }) {
  const projectSlug = useProjectSlug()
  const [isFocused, setIsFocused] = useState(false)
  const str = summaryValue == null ? "" : String(summaryValue)

  const hasContent = Boolean(str && str.trim())
  const disclaimerText =
    "\n\n*Die Zusammenfassung wurde mit KI erstellt und dient der Orientierung und ersetzt nicht die Prüfung des Originaldokuments*"

  const handleSummarize = async () => {
    setIsGeneratingSummary(true)
    try {
      const { summary } = await summarizeUpload({ uploadId, projectSlug })
      if (summary) {
        void form.setFieldValue("summary" as never, (summary + disclaimerText) as never)
      } else {
        throw new Error("Invalid response data")
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      alert("Fehler beim Generieren der Zusammenfassung")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const showAiButton = isPdf(mimeType) && isAiEnabled
  const shouldExpand = isFocused || hasContent
  const rows = shouldExpand ? 20 : 2

  return (
    <div>
      <LabeledTextareaField
        form={form}
        help={
          showAiButton
            ? "PDFs lassen sich mit KI zusammenfassen. Beachten Sie, dass nach Drücken des Buttons eine bereits vorhandene Zusammenfassung im Textfeld überschrieben wird."
            : undefined
        }
        optional
        rows={rows}
        name="summary"
        label="Zusammenfassung"
        disabled={isGeneratingSummary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {!isAiEnabled && isPdf(mimeType) && (
        <SuperAdminBox className="mt-4">
          <p className="mb-2 font-semibold">KI-Funktionen sind deaktiviert</p>
          <p className="mb-3 text-sm">
            Um die automatische Zusammenfassung von PDF-Dokumenten zu nutzen, müssen die
            KI-Funktionen für dieses Projekt aktiviert werden.
          </p>
          <Link
            href={`/admin/projects`}
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Zu den Projekt-Einstellungen
          </Link>
        </SuperAdminBox>
      )}
      {showAiButton && uploadId && (
        <button
          type="button"
          onClick={handleSummarize}
          disabled={isGeneratingSummary}
          className={twJoin(blueButtonStyles, "mt-2 gap-1")}
        >
          <SparklesIcon className="h-3 w-3" />
          <p className={isGeneratingSummary ? "animate-pulse" : ""}>
            {isGeneratingSummary
              ? "Dokument wird mit KI zusammengefasst..."
              : "Dokument mit KI zusammenfassen"}
          </p>
        </button>
      )}
    </div>
  )
}

export const SummaryField = (props: Props) => {
  const { form, initialSummary, ...rest } = props
  return (
    <form.Subscribe selector={(s) => s.values.summary}>
      {(summaryValue) => (
        <SummaryFieldBody
          form={form}
          summaryValue={summaryValue}
          initialSummary={initialSummary}
          {...rest}
        />
      )}
    </form.Subscribe>
  )
}
