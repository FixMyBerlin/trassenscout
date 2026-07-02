import { Switch } from "@headlessui/react"
import { ErrorMessage } from "@hookform/error-message"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, PropsWithoutRef } from "react"
import { Controller, useFormContext } from "react-hook-form"

/**
 * Headless UI `Switch` bound to React Hook Form via `Controller` (not `register`).
 * Do **not** pass `name` to the underlying `Switch`: RHF owns the value; a native
 * `name` on `Switch` would duplicate the field (Headless also renders a hidden input).
 */
export interface LabeledSwitchProps<T extends boolean | string | number = boolean> {
  /** Field name in the form. */
  name: string
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
  classLabelOverwrite?: string
  /**
   * Form values for off / on. Omit the whole object for a boolean field (`false` /
   * `true`); otherwise pass both `off` and `on` (e.g. two enum strings).
   */
  values?: { off: T; on: T }
  /**
   * Copy for the active state, shown beside the switch (off label when off, on label
   * when on). Omit to hide the inline state label.
   */
  stateLabels?: { off: string; on: string }
  /**
   * Tailwind classes for the switch track when not in an error state (border,
   * background). Defaults: gray track when off, blue when on.
   */
  trackClassNames?: { off: string; on: string }
  onChange?: (value: T) => void
}

const defaultTrackClassNames = {
  off: "bg-gray-200",
  on: "bg-blue-600",
} as const

export function LabeledSwitch<T extends boolean | string | number = boolean>(
  props: LabeledSwitchProps<T>,
) {
  const {
    name,
    label,
    help,
    outerProps,
    labelProps,
    optional,
    classLabelOverwrite,
    values,
    stateLabels,
    trackClassNames,
    onChange: onChangeCallback,
  } = props

  const resolvedOff = values ? values.off : false
  const resolvedOn = values ? values.on : true

  const toneTrack = {
    off: trackClassNames?.off ?? defaultTrackClassNames.off,
    on: trackClassNames?.on ?? defaultTrackClassNames.on,
  }

  const {
    control,
    formState: { isSubmitting, errors },
  } = useFormContext()

  const hasError = Boolean(errors[name])

  return (
    <div {...outerProps}>
      <label
        {...labelProps}
        htmlFor={name}
        className={classLabelOverwrite || "mb-1 block text-sm font-medium text-gray-700"}
      >
        {label}
        {optional && <> (optional)</>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const checked = field.value === resolvedOn

          const activeStateLabel = stateLabels ? (checked ? stateLabels.on : stateLabels.off) : null

          return (
            <div className="flex items-center gap-3">
              <Switch
                ref={field.ref}
                id={name}
                checked={checked}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                onChange={(nextChecked) => {
                  const next = (nextChecked ? resolvedOn : resolvedOff) as T
                  field.onChange(next)
                  onChangeCallback?.(next)
                }}
                className={clsx(
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
                <label className="sr-only" htmlFor={name}>
                  {stateLabels ? `${label}: ${activeStateLabel}` : label}
                </label>
                <span
                  aria-hidden
                  className={clsx(
                    "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </Switch>
              {stateLabels && (
                <span aria-hidden className={clsx("min-w-0 text-sm font-medium transition-colors")}>
                  {activeStateLabel}
                </span>
              )}
            </div>
          )
        }}
      />

      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}

      <ErrorMessage
        render={({ message }) => (
          <div role="alert" className="mt-1 text-sm text-red-800">
            {message}
          </div>
        )}
        errors={errors}
        name={name}
      />
    </div>
  )
}
