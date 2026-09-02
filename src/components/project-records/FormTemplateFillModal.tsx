import { uploadFile } from "@better-upload/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { useCallback, useState } from "react"
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { FormPdfEditor } from "@/src/components/project-records/FormPdfEditor"
import { readPdfFormValues } from "@/src/components/project-records/readPdfFormValues"
import { useUploadRecordCreation } from "@/src/components/uploads/useUploadRecordCreation"
import {
  formFieldValuesQueryOptions,
  formTemplatesByProjectQueryOptions,
} from "@/src/server/formTemplates/formTemplatesQueryOptions"
import { resolveFormTemplateFields } from "@/src/shared/formTemplates/fieldSchemas"
import { buildFormPdfFilename } from "@/src/shared/formTemplates/pdfFilename"

type Props = {
  projectSlug: string
  projectRecordId: number
  /** Part of the download filename. */
  filenameContext?: string | null
  formTemplateId: number | null
  onClose: () => void
  onSaved?: () => void
}

const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const FormTemplateFillModal = ({
  projectSlug,
  projectRecordId,
  filenameContext,
  formTemplateId,
  onClose,
  onSaved,
}: Props) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null)
  const [busy, setBusy] = useState<null | "download" | "flatten" | "save">(null)
  const [error, setError] = useState<string | null>(null)
  const [savedFilename, setSavedFilename] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: formTemplates, isPending } = useQuery({
    ...formTemplatesByProjectQueryOptions({ projectSlug }),
    enabled: formTemplateId !== null,
  })

  const createUploadRecord = useUploadRecordCreation({
    projectSlug,
    relations: { projectRecords: [projectRecordId] },
  })

  const formTemplate = formTemplates?.find((candidate) => candidate.id === formTemplateId)
  const fields = resolveFormTemplateFields(formTemplate?.bodyMarkdown, formTemplate?.fields)

  /**
   * Keyed on the template alone: prefill values are fetched inside the query, because as a
   * dependency a later refetch would regenerate the document and discard what the user typed.
   * A failed read opens the form unprefilled rather than hanging on a spinner.
   */
  const {
    data: pdfData,
    isPending: isGenerating,
    isError: generationFailed,
  } = useQuery({
    queryKey: ["formTemplatePdf", formTemplateId],
    enabled: Boolean(formTemplate),
    staleTime: Infinity,
    gcTime: 0,
    queryFn: async () => {
      if (!formTemplate) throw new Error("Kein Formular geladen.")

      const values = await queryClient
        .fetchQuery(
          formFieldValuesQueryOptions({
            projectSlug,
            projectRecordId,
            formTemplateId: formTemplate.id,
          }),
        )
        .catch((caught) => {
          console.error("Form prefill failed:", caught)
          return {} as Record<string, string>
        })

      const { renderFormTemplatePdf } = await import("./formTemplatePdf")
      const blob = await renderFormTemplatePdf({
        markdown: formTemplate.bodyMarkdown,
        title: formTemplate.title,
        fields,
        values,
        fillable: true,
      })
      return new Uint8Array(await blob.arrayBuffer())
    },
  })

  const buildFilename = useCallback(
    (variant: "ausgefuellt" | "ausfuellbar") =>
      buildFormPdfFilename({
        formSlug: `${formTemplate?.slug ?? "formular"}-${variant}`,
        projectSlug,
        context: filenameContext,
        date: new Date(),
      }),
    [formTemplate?.slug, projectSlug, filenameContext],
  )

  const handleClose = () => {
    setPdfDocument(null)
    setError(null)
    setSavedFilename(null)
    setBusy(null)
    onClose()
  }

  const exportFilled = async () => {
    if (!pdfDocument) throw new Error("Formular noch nicht geladen.")
    const saved = await pdfDocument.saveDocument()
    return new Blob([saved as unknown as BlobPart], { type: "application/pdf" })
  }

  /** Re-renders with the entries as plain text: the print-and-sign version. */
  const exportFlattened = async () => {
    if (!pdfDocument || !formTemplate) throw new Error("Formular noch nicht geladen.")
    const { renderFormTemplatePdf } = await import("./formTemplatePdf")
    return renderFormTemplatePdf({
      markdown: formTemplate.bodyMarkdown,
      title: formTemplate.title,
      fields,
      values: await readPdfFormValues(pdfDocument),
      fillable: false,
    })
  }

  const run = async (
    mode: "download" | "flatten" | "save",
    action: () => Promise<{ blob: Blob; filename: string }>,
  ) => {
    setBusy(mode)
    setError(null)
    setSavedFilename(null)
    try {
      const { blob, filename } = await action()
      if (mode === "save") {
        const result = await uploadFile({
          api: `/api/${projectSlug}/upload`,
          route: "upload",
          file: new File([blob], filename, { type: "application/pdf" }),
          metadata: { projectRecordId },
        })
        await createUploadRecord(result.file)
        setSavedFilename(filename)
        onSaved?.()
      } else {
        triggerBrowserDownload(blob, filename)
      }
    } catch (caught) {
      console.error("Form PDF action failed:", caught)
      setError(
        mode === "save"
          ? "Das PDF konnte nicht am Protokolleintrag gespeichert werden."
          : "Das PDF konnte nicht erzeugt werden.",
      )
    } finally {
      setBusy(null)
    }
  }

  const ready = Boolean(pdfDocument) && busy === null && !isGenerating

  return (
    <Modal
      open={formTemplateId !== null}
      handleClose={handleClose}
      align="center"
      className="sm:max-w-4xl"
    >
      <PageHeader
        title={formTemplate ? `Formular: ${formTemplate.title}` : "Formular"}
        action={<ModalCloseButton onClose={handleClose} />}
      />

      <div className={`${pageContentPaddingClassName} space-y-4 pb-6`}>
        {isPending && <Spinner />}

        {!isPending && !formTemplate && (
          <p className="text-sm text-gray-600">Das Formular konnte nicht geladen werden.</p>
        )}

        {formTemplate && (
          <>
            <p className="text-sm text-gray-600">
              Die hellblauen Felder im Dokument können direkt ausgefüllt werden.
              {fields.length === 0 &&
                " Dieses Formular enthält noch keine Platzhalter — ein:e Admin kann sie im Formulartemplate ergänzen."}
            </p>

            {pdfData ? (
              <FormPdfEditor data={pdfData} onDocumentReady={setPdfDocument} />
            ) : generationFailed ? (
              <p className="text-sm text-red-700">Das Formular konnte nicht erzeugt werden.</p>
            ) : (
              <Spinner />
            )}

            {error && <p className="text-sm text-red-700">{error}</p>}
            {savedFilename && (
              <p className="text-sm text-green-700">
                Als „{savedFilename}“ am Protokolleintrag gespeichert.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={primaryButtonClassName}
                disabled={!ready}
                onClick={() =>
                  run("download", async () => ({
                    blob: await exportFilled(),
                    filename: buildFilename("ausfuellbar"),
                  }))
                }
              >
                {busy === "download" ? "PDF wird erstellt …" : "Ausgefülltes PDF herunterladen"}
              </button>
              <button
                type="button"
                className={secondaryButtonClassName}
                disabled={!ready}
                onClick={() =>
                  run("flatten", async () => ({
                    blob: await exportFlattened(),
                    filename: buildFilename("ausgefuellt"),
                  }))
                }
              >
                {busy === "flatten" ? "PDF wird erstellt …" : "Druckversion (nicht änderbar)"}
              </button>
              <button
                type="button"
                className={secondaryButtonClassName}
                disabled={!ready}
                onClick={() =>
                  run("save", async () => ({
                    blob: await exportFilled(),
                    filename: buildFilename("ausfuellbar"),
                  }))
                }
              >
                {busy === "save" ? "Wird gespeichert …" : "Am Protokolleintrag speichern"}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Das gespeicherte PDF bleibt ausfüllbar und kann später weiterbearbeitet werden.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
