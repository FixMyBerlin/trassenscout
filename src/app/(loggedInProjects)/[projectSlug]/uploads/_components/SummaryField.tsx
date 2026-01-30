"use client"

import { summarizeUpload } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_actions/summarizeUpload"
import { isPdf } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { LabeledTextareaField } from "@/src/core/components/forms"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { SparklesIcon } from "@heroicons/react/16/solid"
import { Dispatch, SetStateAction, useState } from "react"
import { useFormContext } from "react-hook-form"
import { twJoin } from "tailwind-merge"

type Props = {
  uploadId: number
  mimeType: string | null
  isGeneratingSummary: boolean
  setIsGeneratingSummary: Dispatch<SetStateAction<boolean>>
  isAiEnabled: boolean
  initialSummary?: string | null
}

export const SummaryField = ({
  uploadId,
  mimeType,
  isGeneratingSummary,
  setIsGeneratingSummary,
  isAiEnabled,
  initialSummary,
}: Props) => {
  const { setValue, watch } = useFormContext()
  const projectSlug = useProjectSlug()
  const [isFocused, setIsFocused] = useState(false)
  const summaryValue = watch("summary")

  const hasContent = Boolean(summaryValue && summaryValue.trim())
  const hasInitialContent = Boolean(initialSummary && initialSummary.trim())
  const shouldExpand = isFocused || hasContent || hasInitialContent
  const rows = shouldExpand ? 20 : 2

  const disclaimerText =
    "\n\n*Die Zusammenfassung wurde mit KI erstellt und dient der Orientierung und ersetzt nicht die Prüfung des Originaldokuments*"

  const handleSummarize = async () => {
    setIsGeneratingSummary(true)
    try {
      const { summary } = await summarizeUpload({ uploadId, projectSlug })
      if (summary) {
        setValue("summary", summary + disclaimerText, { shouldDirty: true })
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

  return (
    <div>
      <LabeledTextareaField
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
