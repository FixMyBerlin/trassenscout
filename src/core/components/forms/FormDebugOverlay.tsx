"use client"

import { useFormShellState } from "@/src/core/components/forms/hooks/useFormShellState"
import { isDev } from "@/src/core/utils/isEnv"
import type { AnyFieldMeta } from "@tanstack/react-form"
import { useState } from "react"

type FormDebugOverlayProps = {
  /** Shown when true. Defaults to local dev (`isDev`). */
  enabled?: boolean
  /** `FORM_ERROR` from `<Form>` submit handling (outside TanStack state). */
  formError?: unknown
}

function formatValidationError(err: unknown) {
  if (typeof err === "string") return err
  if (err && typeof err === "object" && "message" in err) {
    const message = err.message
    if (typeof message === "string") return message
  }
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

function collectFieldErrors(fieldMeta: Partial<Record<string, AnyFieldMeta>>) {
  const byField: Record<string, string[]> = {}

  for (const [name, meta] of Object.entries(fieldMeta)) {
    if (!meta) continue
    const messages: string[] = []

    for (const err of meta.errors ?? []) {
      messages.push(formatValidationError(err))
    }

    if (meta.errorMap) {
      for (const [source, errs] of Object.entries(meta.errorMap)) {
        if (!Array.isArray(errs) || errs.length === 0) continue
        for (const err of errs) {
          messages.push(`[${source}] ${formatValidationError(err)}`)
        }
      }
    }

    if (messages.length > 0) {
      byField[name] = [...new Set(messages)]
    }
  }

  return byField
}

function stringifyForDebug(value: unknown, depth = 0): unknown {
  if (depth > 4) return "…"
  if (value == null || typeof value !== "object") {
    if (typeof value === "string" && value.length > 240) {
      return `${value.slice(0, 240)}… (${value.length} chars)`
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => stringifyForDebug(item, depth + 1))
  }
  const out: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    out[key] = stringifyForDebug(entry, depth + 1)
  }
  return out
}

function formatFormError(formError: unknown) {
  if (formError == null || formError === "") return null
  if (typeof formError === "string") return formError
  if (
    formError &&
    typeof formError === "object" &&
    "name" in formError &&
    formError.name === "ZodError" &&
    "issues" in formError &&
    Array.isArray(formError.issues) &&
    formError.issues.length > 0
  ) {
    return formError.issues
      .map((issue) => {
        if (issue && typeof issue === "object" && "path" in issue && "message" in issue) {
          const path = Array.isArray(issue.path) ? issue.path.join(".") : ""
          const message = typeof issue.message === "string" ? issue.message : String(issue.message)
          return `${path}: ${message}`
        }
        return String(issue)
      })
      .join("\n")
  }
  try {
    return JSON.stringify(formError, null, 2)
  } catch {
    return String(formError)
  }
}

const GEOJSON_GEOMETRY_TYPES = new Set([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
])

function isGeoJsonGeometry(value: unknown) {
  if (!value || typeof value !== "object") return false
  if (!("type" in value) || !("coordinates" in value)) return false
  const type = value.type
  return typeof type === "string" && GEOJSON_GEOMETRY_TYPES.has(type)
}

function isGeometryField(key: string, value: unknown) {
  return key === "geometry" || isGeoJsonGeometry(value)
}

function formatGeometryJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function summarizeValue(value: unknown) {
  if (value == null) return "∅"
  if (typeof value === "string") {
    return value.length > 48 ? `"${value.slice(0, 48)}…"` : `"${value}"`
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return `[${value.length}]`
  if (typeof value === "object") return "{…}"
  return String(value)
}

function partitionValueKeys(values: Record<string, unknown>) {
  const geometryKeys: string[] = []
  const otherKeys: string[] = []
  for (const key of Object.keys(values)) {
    if (isGeometryField(key, values[key])) {
      geometryKeys.push(key)
    } else {
      otherKeys.push(key)
    }
  }
  return { geometryKeys, otherKeys }
}

/**
 * Dev overlay: live TanStack values + field/form errors. Must render inside `<Form>` / `form.AppForm`.
 */
export function FormDebugOverlay({ enabled = isDev, formError }: FormDebugOverlayProps) {
  const { form } = useFormShellState()
  const [expanded, setExpanded] = useState(false)

  if (!enabled) return null

  const displayFormError = formatFormError(formError)

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        fieldMeta: state.fieldMeta,
        errorMap: state.errorMap,
        errors: state.errors,
        isDirty: state.isDirty,
        isSubmitting: state.isSubmitting,
        isValid: state.isValid,
        canSubmit: state.canSubmit,
      })}
    >
      {(snapshot) => {
        const fieldErrors = collectFieldErrors(snapshot.fieldMeta)
        const fieldErrorCount = Object.keys(fieldErrors).length
        const formErrorCount = snapshot.errors?.length ?? 0
        const errorMapKeys = snapshot.errorMap ? Object.keys(snapshot.errorMap).length : 0
        const hasFormError = Boolean(displayFormError)
        const totalErrors =
          fieldErrorCount + formErrorCount + (hasFormError ? 1 : 0) + (errorMapKeys > 0 ? 1 : 0)

        const rawValues = snapshot.values
        const values: Record<string, unknown> =
          rawValues && typeof rawValues === "object" && !Array.isArray(rawValues) ? rawValues : {}
        const { geometryKeys, otherKeys } = partitionValueKeys(values)
        const valueKeys = Object.keys(values)
        const statusParts: string[] = []
        if (snapshot.isSubmitting) statusParts.push("submitting")
        if (snapshot.isDirty) statusParts.push("dirty")
        if (snapshot.isValid === false) statusParts.push("invalid")
        if (snapshot.canSubmit === false) statusParts.push("blocked")

        const formErrorMapJson = JSON.stringify(snapshot.errorMap, null, 2)
        const formErrorsJson = JSON.stringify(snapshot.errors, null, 2)
        const fieldErrorsJson = JSON.stringify(fieldErrors, null, 2)

        return (
          <div
            className="fixed top-3 right-3 z-9999 max-w-[min(24rem,calc(100vw-1.5rem))] font-mono text-[10px] leading-tight text-amber-950 shadow-lg"
            data-form-debug
          >
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="w-full rounded border border-amber-500 bg-amber-50/95 px-2 py-1 text-left hover:bg-amber-100"
              aria-expanded={expanded}
              aria-label={
                expanded ? "Form debug details ausblenden" : "Form debug details anzeigen"
              }
            >
              <span className="font-sans text-[11px] font-bold text-amber-900">Form</span>
              <span className="ml-1.5 text-amber-800">
                {valueKeys.length} field{valueKeys.length === 1 ? "" : "s"}
                {totalErrors > 0 ? (
                  <span className="ml-1.5 font-semibold text-red-800">
                    · {totalErrors} error{totalErrors === 1 ? "" : "s"}
                  </span>
                ) : (
                  <span className="ml-1.5 text-green-800">· ok</span>
                )}
                {statusParts.length > 0 ? (
                  <span className="ml-1.5 text-amber-700">· {statusParts.join(", ")}</span>
                ) : null}
              </span>
              {!expanded && fieldErrorCount > 0 ? (
                <span className="mt-0.5 block truncate text-red-800">
                  {Object.entries(fieldErrors)
                    .slice(0, 3)
                    .map(([name, msgs]) => `${name}: ${msgs[0]}`)
                    .join(" · ")}
                  {fieldErrorCount > 3 ? " …" : ""}
                </span>
              ) : null}
              {!expanded && hasFormError ? (
                <span className="mt-0.5 block truncate text-red-800">
                  FORM_ERROR: {displayFormError!.split("\n")[0]}
                </span>
              ) : null}
              <span className="mt-0.5 block text-[9px] text-amber-600">
                {expanded ? "▲ collapse" : "▼ details"}
              </span>
            </button>

            {geometryKeys.length > 0 ? (
              <div className="mt-1 max-h-48 overflow-auto rounded border border-amber-600/80 bg-amber-50/98 p-1.5">
                {geometryKeys.map((key) => (
                  <div key={key} className={geometryKeys.length > 1 ? "mb-2 last:mb-0" : ""}>
                    <div className="font-semibold text-amber-900">
                      {key}
                      {key === "geometry" && values.type != null ? (
                        <span className="ml-1 font-normal text-amber-700">
                          (type: {String(values.type)})
                        </span>
                      ) : null}
                    </div>
                    <pre className="text-[9px] break-all whitespace-pre-wrap text-amber-950">
                      {formatGeometryJson(values[key])}
                    </pre>
                  </div>
                ))}
              </div>
            ) : null}

            {expanded ? (
              <div className="mt-1 max-h-[min(70vh,28rem)] overflow-auto rounded border border-amber-500 bg-amber-50/98 p-2">
                {displayFormError ? (
                  <section className="mb-2">
                    <div className="font-semibold text-red-800">FORM_ERROR (submit)</div>
                    <pre className="whitespace-pre-wrap text-red-900">{displayFormError}</pre>
                  </section>
                ) : null}

                {fieldErrorCount > 0 ? (
                  <section className="mb-2">
                    <div className="font-semibold text-red-800">Field errors</div>
                    <pre className="whitespace-pre-wrap text-red-900">{fieldErrorsJson}</pre>
                  </section>
                ) : null}

                {formErrorCount > 0 ? (
                  <section className="mb-2">
                    <div className="font-semibold text-red-800">Form errors</div>
                    <pre className="whitespace-pre-wrap text-red-900">{formErrorsJson}</pre>
                  </section>
                ) : null}

                {errorMapKeys > 0 ? (
                  <section className="mb-2">
                    <div className="font-semibold text-red-800">Form errorMap</div>
                    <pre className="whitespace-pre-wrap text-red-900">{formErrorMapJson}</pre>
                  </section>
                ) : null}

                {otherKeys.length > 0 ? (
                  <section>
                    <div className="font-semibold text-amber-900">Other values</div>
                    <ul className="mb-1 list-none space-y-0.5">
                      {otherKeys.map((key) => (
                        <li key={key} className="truncate">
                          <span className="text-amber-800">{key}:</span>{" "}
                          {summarizeValue(values[key])}
                        </li>
                      ))}
                    </ul>
                    <details className="text-amber-800">
                      <summary className="cursor-pointer text-[9px]">JSON (non-geometry)</summary>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(
                          stringifyForDebug(
                            Object.fromEntries(otherKeys.map((key) => [key, values[key]])),
                          ),
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      }}
    </form.Subscribe>
  )
}
