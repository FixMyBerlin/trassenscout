import { Switch as HeadlessSwitch } from "@headlessui/react"
import type { JSX } from "react"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"
import { twJoin } from "tailwind-merge"
import { FieldErrors } from "@/src/components/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFieldDisabled } from "@/src/components/core/components/forms/hooks/useFormHydrated"

export type SwitchProps<T extends boolean | string | number = boolean> = {
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  classLabelOverwrite?: string
  values?: { off: T; on: T }
  stateLabels?: { off: string; on: string }
  trackClassNames?: { off: string; on: string }
  disabled?: boolean
  onChange?: (value: T) => void
}

const defaultTrackClassNames = {
  off: "bg-gray-200",
  on: "bg-blue-600",
} as const

export function Switch<T extends boolean | string | number = boolean>(props: SwitchProps<T>) {
  const {
    label,
    help,
    outerProps,
    labelProps,
    optional,
    classLabelOverwrite,
    values,
    stateLabels,
    trackClassNames,
    disabled,
    onChange: onChangeCallback,
  } = props

  const field = useFieldContext<T>()
  const fieldDisabled = useFieldDisabled(disabled)
  const resolvedOff = values ? values.off : (false as T)
  const resolvedOn = values ? values.on : (true as T)
  const toneTrack = {
    off: trackClassNames?.off ?? defaultTrackClassNames.off,
    on: trackClassNames?.on ?? defaultTrackClassNames.on,
  }
  const hasError = field.state.meta.errors.length > 0
  const checked = field.state.value === resolvedOn
  const activeStateLabel = stateLabels ? (checked ? stateLabels.on : stateLabels.off) : null

  return (
    <div {...outerProps}>
      <label
        {...labelProps}
        htmlFor={field.name}
        className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
      >
        {label}
        {optional && <> (optional)</>}
      </label>

      <div className="flex items-center gap-3">
        <HeadlessSwitch
          id={field.name}
          checked={checked}
          onBlur={field.handleBlur}
          disabled={fieldDisabled}
          onChange={(nextChecked) => {
            const next = (nextChecked ? resolvedOn : resolvedOff) as T
            field.handleChange(next)
            onChangeCallback?.(next)
          }}
          className={twJoin(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? checked
                ? "border-red-800 bg-red-600 focus-visible:ring-red-800"
                : "border-red-800 bg-gray-200 focus-visible:ring-red-800"
              : checked
                ? toneTrack.on
                : toneTrack.off,
          )}
        >
          <label className="sr-only" htmlFor={field.name}>
            {stateLabels ? `${label}: ${activeStateLabel}` : label}
          </label>
          <span
            aria-hidden
            className={twJoin(
              "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-6" : "translate-x-1",
            )}
          />
        </HeadlessSwitch>
        {stateLabels && (
          <span aria-hidden className="min-w-0 text-sm font-medium transition-colors">
            {activeStateLabel}
          </span>
        )}
      </div>

      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}
