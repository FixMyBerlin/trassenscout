import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { useCallback, useState } from "react"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import {
  checkboxInputClassName,
  checkboxLabelClassName,
  checkboxRowClassName,
} from "@/src/components/core/components/forms/styles/checkboxFieldStyles"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { FormPdfEditor } from "@/src/components/project-records/FormPdfEditor"
import { readPdfFormValues } from "@/src/components/project-records/readPdfFormValues"
import {
  formFieldValuesQueryOptions,
  formTemplatesByProjectQueryOptions,
} from "@/src/server/formTemplates/formTemplatesQueryOptions"
import { resolveFormTemplateFields } from "@/src/shared/formTemplates/fieldSchemas"
import { buildFormPdfFilename } from "@/src/shared/formTemplates/pdfFilename"

type Props = {
  projectSlug: string
  projectRecordId?: number | null
  /** Part of the download filename. */
  filenameContext?: string | null
  formTemplateId: number | null
  onClose: () => void
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
}: Props) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Off by default: the download is the print version unless someone wants to keep filling it in.
  const [keepFieldsEditable, setKeepFieldsEditable] = useState(false)
  const queryClient = useQueryClient()

  const { data: formTemplates, isPending } = useQuery({
    ...formTemplatesByProjectQueryOptions({ projectSlug }),
    enabled: formTemplateId !== null,
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

      const values = projectRecordId
        ? await queryClient
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
        : {}

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
    setBusy(false)
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

  const download = async () => {
    setBusy(true)
    setError(null)
    try {
      const blob = keepFieldsEditable ? await exportFilled() : await exportFlattened()
      triggerBrowserDownload(
        blob,
        buildFilename(keepFieldsEditable ? "ausfuellbar" : "ausgefuellt"),
      )
    } catch (caught) {
      console.error("Form PDF action failed:", caught)
      setError("Das PDF konnte nicht erzeugt werden.")
    } finally {
      setBusy(false)
    }
  }

  const ready = Boolean(pdfDocument) && !busy && !isGenerating

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

      <div className={`${pageContentPaddingClassName} space-y-4`}>
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

            <p className="text-sm text-gray-500">
              Ohne Haken wird eine Druckversion erzeugt: die Eintragungen stehen dann als fester
              Text im PDF und lassen sich nicht mehr ändern.
            </p>
          </>
        )}
      </div>

      {formTemplate && (
        <ActionBar
          left={
            <div className={checkboxRowClassName}>
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  id="keepFieldsEditable"
                  checked={keepFieldsEditable}
                  onChange={(event) => setKeepFieldsEditable(event.target.checked)}
                  className={checkboxInputClassName({ hasError: false })}
                />
              </div>
              <label htmlFor="keepFieldsEditable" className={checkboxLabelClassName({})}>
                Formularfelder editierbar lassen
              </label>
            </div>
          }
          right={
            <button
              type="button"
              className={primaryButtonClassName}
              disabled={!ready}
              onClick={() => void download()}
            >
              {busy ? "PDF wird erstellt …" : "Ausgefülltes PDF herunterladen"}
            </button>
          }
        />
      )}
    </Modal>
  )
}
