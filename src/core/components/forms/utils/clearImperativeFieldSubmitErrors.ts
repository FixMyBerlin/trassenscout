import type { AnyFormApi } from "@tanstack/react-form"

/**
 * When we update a form value imperatively (without a mounted `<form.Field>`),
 * TanStack can't always clear stale submit/server errors for that field.
 *
 * Clearing these mirrors the behavior mounted fields get automatically.
 */
export function clearImperativeFieldSubmitErrors(form: AnyFormApi, name: string) {
  const meta = form.getFieldMeta(name)

  const hasSubmit = Boolean(meta?.errorMap && "onSubmit" in meta.errorMap)
  const hasServer = Boolean(meta?.errorMap && "onServer" in meta.errorMap)

  if (!hasSubmit && !hasServer) return

  form.setFieldMeta(name, (prev) => ({
    ...prev,
    errorMap: {
      ...(prev?.errorMap ?? {}),
      onSubmit: undefined,
      onServer: undefined,
    },
    errorSourceMap: {
      ...(prev?.errorSourceMap ?? {}),
      onSubmit: undefined,
      onServer: undefined,
    },
  }))
}
