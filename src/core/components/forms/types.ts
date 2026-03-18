import type { FormApi as TanStackFormApi } from "@tanstack/form-core"
import type { ReactFormApi } from "@tanstack/react-form"

type _ = any
export type FormApi<T> = TanStackFormApi<T, _, _, _, _, _, _, _, _, _, _, _> &
  ReactFormApi<T, _, _, _, _, _, _, _, _, _, _, _>

export type SubmitResult<T = Record<string, unknown>> =
  | { success: true; message?: string }
  | {
      success: false
      message: string
      errors?: Partial<Record<Extract<keyof T, string>, string[]>>
    }
