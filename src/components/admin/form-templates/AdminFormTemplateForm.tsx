import { useSuspenseQuery } from "@tanstack/react-query"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { twJoin } from "tailwind-merge"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import type { FormTemplateTypeEnum } from "@/src/prisma/generated/browser"
import { projectsAdminQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  convertBlanksToPlaceholders,
  type FormTemplateFieldDefinition,
  formTemplateFieldTypeLabels,
  formTemplateFieldTypes,
  resolveFormTemplateFields,
} from "@/src/shared/formTemplates/fieldSchemas"
import {
  formTemplateFormDefaultValues,
  FormTemplateFormSchema,
  type FormTemplateFormFieldValues,
  formTemplateTypeLabels,
} from "@/src/shared/formTemplates/schemas"
import { formFieldSourcesForType } from "@/src/shared/formTemplates/sourceRegistry"

export type AdminFormTemplateFormProps = {
  initialValues?: Partial<FormTemplateFormFieldValues>
  onSubmit: (values: z.infer<typeof FormTemplateFormSchema>) => Promise<void | OnSubmitResult>
  submitText: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
}

/** Shared so the header and the rows cannot drift apart. */
const fieldRowColumnsClassName =
  "gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)]"

const inputClassName =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"

const tabClassName = (active: boolean) =>
  twJoin(
    "cursor-pointer rounded-t-md border border-b-0 px-3 py-1.5 text-sm",
    active
      ? "border-gray-300 bg-white font-medium text-gray-800"
      : "border-transparent text-gray-500 hover:text-gray-700",
  )

const MarkdownField = () => {
  const [showPreview, setShowPreview] = useState(false)
  const bodyMarkdown = useFormValue<string>("bodyMarkdown")
  const form = useCoreAppFormContext()

  // Placeholders render as inline code so the admin can see where the fields will sit.
  const preview = (bodyMarkdown || "").replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (_, name: string) => `\`{{${name}}}\``,
  )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-300">
        <p className="mb-1.5 text-sm font-medium text-gray-700">Formulartext (Markdown)</p>
        <div className="flex gap-1">
          <button
            type="button"
            className={tabClassName(!showPreview)}
            onClick={() => setShowPreview(false)}
          >
            Bearbeiten
          </button>
          <button
            type="button"
            className={tabClassName(showPreview)}
            onClick={() => setShowPreview(true)}
          >
            Vorschau
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="min-h-[20rem] rounded-b-md border border-t-0 border-gray-300 bg-white p-4">
          {bodyMarkdown?.trim() ? (
            <Markdown markdown={preview} />
          ) : (
            <p className="text-sm text-gray-500">Noch kein Formulartext.</p>
          )}
        </div>
      ) : (
        <form.AppField name="bodyMarkdown">
          {(field) => (
            <field.TextareaField
              label="Formulartext (Markdown)"
              labelProps={{ className: "sr-only" }}
              rows={20}
              help="Platzhalter für auszufüllende Werte in doppelten geschweiften Klammern, z. B. {{ort}}."
            />
          )}
        </form.AppField>
      )}
    </div>
  )
}

/** Rows come from the placeholders in the document; this only labels and types them. */
const PlaceholderFields = () => {
  const form = useCoreAppFormContext()
  const bodyMarkdown = useFormValue<string>("bodyMarkdown")
  const storedFields = useFormValue<FormTemplateFieldDefinition[]>("fields")
  const templateType = useFormValue<FormTemplateTypeEnum>("type")

  const detectedFields = resolveFormTemplateFields(bodyMarkdown, storedFields)
  const sources = formFieldSourcesForType(templateType ?? "SUBSUBSECTION")
  const sourceKeys = useMemo(() => new Set(sources.map((source) => source.key)), [sources])

  useEffect(
    function dropSourcesWhenTypeChanges() {
      const stale = detectedFields.filter((field) => field.source && !sourceKeys.has(field.source))
      if (!stale.length) return
      form.setFieldValue(
        "fields",
        detectedFields.map((field) =>
          field.source && !sourceKeys.has(field.source) ? { ...field, source: undefined } : field,
        ),
      )
    },
    [detectedFields, form, sourceKeys],
  )

  const updateField = (name: string, patch: Partial<FormTemplateFieldDefinition>) => {
    const next = detectedFields.map((field) =>
      field.name === name ? { ...field, ...patch } : field,
    )
    form.setFieldValue("fields", next)
  }

  const blankCount = (bodyMarkdown?.match(/(?:\\?_){4,}/g) || []).length

  return (
    <div className="space-y-3">
      <p className="mb-0 block text-sm font-medium text-gray-700">Felder im Formular</p>
      <p className="mt-0 text-sm text-gray-500">
        Jeder Platzhalter <code>{"{{feldname}}"}</code> im Formulartext wird zu einem Eingabefeld.
        Die Reihenfolge ergibt sich aus dem Text. Der Feldtyp bestimmt Breite und Zeilenzahl des
        Feldes – die Eingabe wird nicht geprüft. Mit einer Vorbelegung wird das Feld beim Öffnen aus
        der Maßnahme bzw. Verhandlungsfläche gefüllt und bleibt änderbar.
      </p>

      {blankCount > 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="m-0">
            Der Formulartext enthält {blankCount} Leerstellen aus Unterstrichen, aber noch keine
            Platzhalter an diesen Stellen. Das passiert typischerweise nach dem Umwandeln aus Word.
          </p>
          <button
            type="button"
            className="mt-2 cursor-pointer rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm text-blue-800 hover:bg-blue-100"
            onClick={() =>
              form.setFieldValue("bodyMarkdown", convertBlanksToPlaceholders(bodyMarkdown))
            }
          >
            Leerstellen in Platzhalter umwandeln
          </button>
        </div>
      )}

      {detectedFields.length === 0 ? (
        <p className="text-sm text-gray-500">Noch keine Platzhalter im Formulartext gefunden.</p>
      ) : (
        <div className="space-y-2">
          {/* Hidden below `sm`, where the rows stack and each control shows its own label. */}
          <div
            className={`hidden px-3 text-sm font-medium text-gray-700 sm:grid ${fieldRowColumnsClassName}`}
          >
            <span>Platzhalter</span>
            <span>Beschriftung</span>
            <span>Feldtyp</span>
            <span>Vorbelegung</span>
          </div>
          {detectedFields.map((field) => (
            <div
              key={field.name}
              className={`grid gap-2 rounded-md border border-gray-200 p-3 sm:items-center ${fieldRowColumnsClassName}`}
            >
              <code className="text-sm text-gray-600">{`{{${field.name}}}`}</code>
              <input
                type="text"
                aria-label={`Beschriftung für ${field.name}`}
                className={inputClassName}
                value={field.label}
                onChange={(event) => updateField(field.name, { label: event.target.value })}
              />
              <select
                aria-label={`Feldtyp für ${field.name}`}
                className={inputClassName}
                value={field.type}
                onChange={(event) =>
                  updateField(field.name, {
                    type: event.target.value as FormTemplateFieldDefinition["type"],
                  })
                }
              >
                {formTemplateFieldTypes.map((type) => (
                  <option key={type} value={type}>
                    {formTemplateFieldTypeLabels[type]}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Vorbelegung für ${field.name}`}
                className={inputClassName}
                value={field.source ?? ""}
                onChange={(event) =>
                  updateField(field.name, { source: event.target.value || undefined })
                }
              >
                <option value="">Keine Vorbelegung</option>
                {sources.map((source) => (
                  <option key={source.key} value={source.key}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ProjectFields = () => {
  const form = useCoreAppFormContext()
  const { data: projectsResult } = useSuspenseQuery(projectsAdminQueryOptions())
  const projects = projectsResult.projects || []

  return (
    <form.AppField name="projectIds">
      {(field) => (
        <field.CheckboxGroup
          label="Aktiv in Projekten"
          optional
          classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
          items={projects.map((project) => ({
            value: String(project.id),
            label: project.slug,
          }))}
        />
      )}
    </form.AppField>
  )
}

export function AdminFormTemplateForm({
  initialValues,
  onSubmit,
  submitText,
  actionBarLeft,
  actionBarRight,
}: AdminFormTemplateFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...formTemplateFormDefaultValues, ...initialValues },
    validators: { onSubmit: FormTemplateFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result =
        (await onSubmit(value as unknown as z.infer<typeof FormTemplateFormSchema>)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      backLink={null}
    >
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel des Formulars" />}
      </form.AppField>
      <form.AppField name="slug">
        {(field) => (
          <field.TextField
            type="text"
            label="Kurzname (Slug)"
            help="Wird für den Dateinamen des PDFs verwendet."
          />
        )}
      </form.AppField>
      <form.AppField name="type">
        {(field) => (
          <field.SelectField
            label="Verfügbar in"
            options={[
              ["SUBSUBSECTION", formTemplateTypeLabels.SUBSUBSECTION],
              ["ACQUISITIONAREA", formTemplateTypeLabels.ACQUISITIONAREA],
            ]}
          />
        )}
      </form.AppField>
      <ProjectFields />
      <MarkdownField />
      <PlaceholderFields />
    </FormShell>
  )
}
