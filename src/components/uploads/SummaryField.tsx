import { SparklesIcon } from "@heroicons/react/16/solid"
import { getRouteApi } from "@tanstack/react-router"
import { Dispatch, SetStateAction, useState } from "react"
import { twJoin } from "tailwind-merge"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { Link } from "@/src/components/core/components/links/Link"
import { isPdfByMimeType } from "@/src/components/uploads/utils/getFileType"
import { summarizeUploadFn } from "@/src/server/uploads/summarizeUpload.functions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

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
  const form = useCoreAppFormContext()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const [isFocused, setIsFocused] = useState(false)
  const summaryValue = useFormValue("summary")

  const hasContent = Boolean(typeof summaryValue === "string" && summaryValue.trim())
  const hasInitialContent = Boolean(initialSummary && initialSummary.trim())
  const shouldExpand = isFocused || hasContent || hasInitialContent
  const rows = shouldExpand ? 20 : 2

  const disclaimerText =
    "\n\n*Die Zusammenfassung wurde mit KI erstellt und dient der Orientierung und ersetzt nicht die Prüfung des Originaldokuments*"

  const handleSummarize = async () => {
    setIsGeneratingSummary(true)
    try {
      const { summary } = await summarizeUploadFn({ data: { uploadId, projectSlug } })
      if (summary) {
        form.setFieldValue("summary", summary + disclaimerText)
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

  const showAiButton = isPdfByMimeType(mimeType) && isAiEnabled

  return (
    <div>
      <form.AppField name="summary">
        {(field) => (
          <div onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <field.TextareaField
              help={
                showAiButton
                  ? "PDFs lassen sich mit KI zusammenfassen. Beachten Sie, dass nach Drücken des Buttons eine bereits vorhandene Zusammenfassung im Textfeld überschrieben wird."
                  : undefined
              }
              rows={rows}
              label="Zusammenfassung"
              disabled={isGeneratingSummary}
            />
          </div>
        )}
      </form.AppField>
      {!isAiEnabled && isPdfByMimeType(mimeType) && (
        <SuperAdminBox className="mt-4">
          <p className="mb-2 font-semibold">KI-Funktionen sind deaktiviert</p>
          <p className="mb-3 text-sm">
            Um die automatische Zusammenfassung von PDF-Dokumenten zu nutzen, müssen die
            KI-Funktionen für dieses Projekt aktiviert werden.
          </p>
          <Link
            to={`/admin/projects`}
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
          className={twJoin(primaryButtonClassName, "mt-2 gap-1")}
        >
          <SparklesIcon className="size-3" />
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
