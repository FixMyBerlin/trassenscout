import type { ReactFormExtendedApi } from "@tanstack/react-form"
import { createFormHookContexts } from "@tanstack/react-form"
import type { CoreAppFormApi } from "@/src/components/core/components/forms/coreFormTypes"

const contexts = createFormHookContexts()

export const { fieldContext, useFieldContext, formContext } = contexts

/** Registered form context for AppField form components (e.g. SubmitButton). */
export function useAppFormContext() {
  return contexts.useFormContext()
}

/** App form context with registered field/form components (AppField, SubmitButton, …). */
export function useCoreAppFormContext<TFormData = Record<string, unknown>>() {
  return contexts.useFormContext() as unknown as CoreAppFormApi<TFormData>
}

// TanStack's createFormHookContexts() defaults TFormData to Record<string, never>,
// which blocks dynamic `name: string` field access in shared form components.
type DynamicFormApi = ReactFormExtendedApi<
  Record<string, unknown>,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>

export function useFormContext() {
  return contexts.useFormContext() as unknown as DynamicFormApi
}
