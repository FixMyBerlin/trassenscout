import { ClientOnly } from "@tanstack/react-router"
import type { ComponentProps } from "react"
import { FormPdfEditor as FormPdfEditorClient } from "./FormPdfEditor.client"

const loading = <p className="p-4 text-sm text-gray-500">Formular wird geladen …</p>

export const FormPdfEditor = (props: ComponentProps<typeof FormPdfEditorClient>) => (
  <ClientOnly fallback={loading}>
    <FormPdfEditorClient {...props} />
  </ClientOnly>
)
