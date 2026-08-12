import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid"
import { PencilIcon } from "@heroicons/react/24/outline"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { z } from "zod"
import {
  adminTableCellClassName,
  adminTableCellRightClassName,
  adminTableCellSubtextClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeaderRightClassName,
} from "@/src/components/admin/adminListClasses"
import {
  AdminTableActions,
  AdminTableDeleteButton,
  AdminTablePrimaryButton,
} from "@/src/components/admin/AdminTableActions"
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsubsectionExtraFieldsProjectsQueryOptions } from "@/src/server/projects/subsubsectionExtraFieldsQueryOptions"
import {
  parseDefinitions,
  sortByOrder,
  type SubsubsectionExtraFieldDefinition,
  SubsubsectionExtraFieldDefinitionsSchema,
} from "@/src/shared/subsubsections/extraFieldSchemas"
import { ExtraFieldDefinitionModal } from "./ExtraFieldDefinitionModal"

const compactSecondaryButtonClassName = twJoin(secondaryButtonClassName, "px-2.5 py-2")

const AdminExtraFieldDefinitionsFormSchema = z.object({
  definitions: SubsubsectionExtraFieldDefinitionsSchema,
})

type FormValues = z.infer<typeof AdminExtraFieldDefinitionsFormSchema>

type AdminSubsubsectionExtraFieldsSubmitResult = void | OnSubmitResult | { cancelled: true }

export type AdminSubsubsectionExtraFieldsFormProps = {
  currentProjectSlug: string
  initialDefinitions: SubsubsectionExtraFieldDefinition[]
  onSubmit: (
    definitions: SubsubsectionExtraFieldDefinition[],
  ) => Promise<AdminSubsubsectionExtraFieldsSubmitResult>
  submitText: string
  submitDisabled?: boolean
  className?: string
}

type ModalState = { mode: "closed" } | { mode: "add" } | { mode: "edit"; index: number }

function normalizeOrders(definitions: SubsubsectionExtraFieldDefinition[]) {
  return definitions.map((definition, index) => ({ ...definition, order: index }))
}

const importSelectClassName = twJoin(
  "rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-xs",
  "focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden",
  "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
)

function formatImportProjectLabel(project: {
  projectSlug: string
  projectSubTitle: string | null
}) {
  const title = shortTitle(project.projectSlug)
  return project.projectSubTitle ? `${title} (${project.projectSubTitle})` : title
}

const IMPORT_CONFIRM_MESSAGE = [
  "Die aktuelle Konfiguration wird durch die Felder des ausgewählten Projekts ersetzt.",
  "Zum Speichern ist weiterhin „Speichern“ erforderlich.",
  "",
  "Fortfahren?",
].join("\n")

export function AdminSubsubsectionExtraFieldsForm({
  currentProjectSlug,
  initialDefinitions,
  onSubmit,
  submitText,
  submitDisabled,
  className,
}: AdminSubsubsectionExtraFieldsFormProps) {
  const queryClient = useQueryClient()
  const { data: projects } = useSuspenseQuery(subsubsectionExtraFieldsProjectsQueryOptions())
  const importableProjects = projects.filter(
    (project) => project.projectSlug !== currentProjectSlug && project.fieldCount > 0,
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" })
  const [addModalKey, setAddModalKey] = useState(0)
  const [importSelectValue, setImportSelectValue] = useState("")

  const form = useAppForm({
    defaultValues: {
      definitions: sortByOrder(initialDefinitions),
    } satisfies FormValues,
    validators: { onSubmit: AdminExtraFieldDefinitionsFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result = await onSubmit(normalizeOrders(value.definitions))
      if (result?.cancelled) return
      applyFormSubmitResult(form, result || {}, setFormError)
    },
  })

  const moveDefinition = (index: number, direction: "up" | "down") => {
    const definitions = form.getFieldValue("definitions")
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= definitions.length) return

    const next = [...definitions]
    const item = next[index]
    const swapWith = next[targetIndex]
    if (!item || !swapWith) return

    next[index] = swapWith
    next[targetIndex] = item
    form.setFieldValue("definitions", normalizeOrders(next))
  }

  const handleImportFromProject = async (sourceSlug: string) => {
    try {
      const definitions = form.getFieldValue("definitions")
      if (definitions.length > 0 && !window.confirm(IMPORT_CONFIRM_MESSAGE)) return

      const sourceProject = await queryClient.fetchQuery(projectBySlugQueryOptions(sourceSlug))
      const sourceDefinitions = parseDefinitions(sourceProject.subsubsectionExtraFieldDefinitions)
      setModalState({ mode: "closed" })
      form.setFieldValue("definitions", normalizeOrders(sourceDefinitions))
    } finally {
      setImportSelectValue("")
    }
  }

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      submitDisabled={submitDisabled}
      backLink={null}
      className={className ?? "max-w-4xl"}
    >
      <p className="text-sm text-gray-600">
        Definieren Sie optionale Textfelder für Maßnahmen in diesem Projekt. Die Reihenfolge
        bestimmt die Anzeige in Formular und Detailansicht.
      </p>

      <form.Subscribe selector={(state) => state.values.definitions}>
        {(definitions) => (
          <>
            <TableWrapper withTopBorder>
              <table className={adminTableClassName}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className={adminTableHeaderClassName}>Bezeichnung</th>
                    <th className={adminTableHeaderClassName}>Feldname</th>
                    <th className={adminTableHeaderClassName}>Reihenfolge</th>
                    <th className={adminTableHeaderRightClassName}>Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {definitions.map((definition, index) => (
                    <tr key={definition.name}>
                      <td className={adminTableCellClassName}>{definition.label}</td>
                      <td className={adminTableCellClassName}>
                        <code className={adminTableCellSubtextClassName}>{definition.name}</code>
                      </td>
                      <td className={adminTableCellClassName}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className={compactSecondaryButtonClassName}
                            disabled={index === 0}
                            onClick={() => moveDefinition(index, "up")}
                            title="Nach oben"
                            aria-label="Nach oben"
                          >
                            <ChevronUpIcon className="size-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            className={compactSecondaryButtonClassName}
                            disabled={index === definitions.length - 1}
                            onClick={() => moveDefinition(index, "down")}
                            title="Nach unten"
                            aria-label="Nach unten"
                          >
                            <ChevronDownIcon className="size-4" aria-hidden />
                          </button>
                        </div>
                      </td>
                      <td className={adminTableCellRightClassName}>
                        <AdminTableActions>
                          <AdminTablePrimaryButton
                            onClick={() => setModalState({ mode: "edit", index })}
                            icon={<PencilIcon aria-hidden />}
                          >
                            Bearbeiten
                          </AdminTablePrimaryButton>
                          <AdminTableDeleteButton
                            label="Feld entfernen"
                            onClick={() => {
                              setModalState({ mode: "closed" })
                              form.setFieldValue(
                                "definitions",
                                normalizeOrders(
                                  definitions.filter((_, rowIndex) => rowIndex !== index),
                                ),
                              )
                            }}
                          />
                        </AdminTableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>

            <ZeroCase small visible={definitions.length} name="zusätzliche Felder" />

            <ButtonWrapper className="flex-wrap items-end">
              <button
                type="button"
                className={primaryButtonClassName}
                onClick={() => {
                  setAddModalKey((current) => current + 1)
                  setModalState({ mode: "add" })
                }}
              >
                {linkIcons.plus}
                Feld hinzufügen
              </button>
              <div className="flex flex-col gap-1">
                <label htmlFor="import-extra-fields" className="text-sm font-medium text-gray-700">
                  Von anderem Projekt übernehmen
                </label>
                <select
                  id="import-extra-fields"
                  className={importSelectClassName}
                  value={importSelectValue}
                  disabled={importableProjects.length === 0}
                  onChange={(event) => {
                    const sourceSlug = event.target.value
                    setImportSelectValue(sourceSlug)
                    if (!sourceSlug) return
                    void handleImportFromProject(sourceSlug)
                  }}
                >
                  <option value="">Projekt auswählen …</option>
                  {importableProjects.map((project) => (
                    <option key={project.projectSlug} value={project.projectSlug}>
                      {formatImportProjectLabel(project)}
                    </option>
                  ))}
                </select>
                {importableProjects.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Kein anderes Projekt mit definierten Feldern vorhanden.
                  </p>
                )}
              </div>
            </ButtonWrapper>

            {modalState.mode !== "closed" && (
              <ExtraFieldDefinitionModal
                key={
                  modalState.mode === "edit"
                    ? `edit-${definitions[modalState.index]?.name}`
                    : `add-${addModalKey}`
                }
                open
                title={modalState.mode === "edit" ? "Feld bearbeiten" : "Neues Feld"}
                submitText={modalState.mode === "edit" ? "Übernehmen" : "Hinzufügen"}
                initialValues={
                  modalState.mode === "edit"
                    ? {
                        name: definitions[modalState.index]?.name ?? "",
                        label: definitions[modalState.index]?.label ?? "",
                      }
                    : { name: "", label: "" }
                }
                nameReadOnly={modalState.mode === "edit"}
                onClose={() => setModalState({ mode: "closed" })}
                onSubmit={(values) => {
                  if (modalState.mode === "add") {
                    if (definitions.some((definition) => definition.name === values.name)) {
                      return {
                        error: `Der Feldname „${values.name}" ist bereits vergeben.`,
                      }
                    }
                    form.setFieldValue(
                      "definitions",
                      normalizeOrders([...definitions, { ...values, order: definitions.length }]),
                    )
                    return
                  }

                  if (modalState.mode === "edit") {
                    form.setFieldValue(
                      "definitions",
                      normalizeOrders(
                        definitions.map((definition, index) =>
                          index === modalState.index
                            ? { ...definition, label: values.label }
                            : definition,
                        ),
                      ),
                    )
                  }
                }}
              />
            )}
          </>
        )}
      </form.Subscribe>
    </FormShell>
  )
}
