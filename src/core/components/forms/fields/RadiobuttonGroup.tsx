"use client"

import { FieldErrors } from "@/src/core/components/forms/FieldErrors"
import { useFieldContext } from "@/src/core/components/forms/hooks/formContext"
import { TagIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { ComponentPropsWithoutRef, ReactNode } from "react"

export type RadiobuttonGroupItem = {
  value: string
  label: ReactNode
  labelProps?: ComponentPropsWithoutRef<"label">
}

export type RadiobuttonGroupProps = {
  label?: string
  optional?: boolean
  disabled?: boolean
  items?: RadiobuttonGroupItem[]
  classLabelOverwrite?: string
  classNameItemWrapper?: string
  onChange?: (value: string) => void
  help?: string | ReactNode
}

const labelPosItems: RadiobuttonGroupItem[] = [
  {
    value: "top",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-225" /> Pfeil unten
      </span>
    ),
  },
  {
    value: "topRight",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-265" /> Pfeil unten links
      </span>
    ),
  },
  {
    value: "right",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-315" /> Pfeil links
      </span>
    ),
  },
  {
    value: "bottomRight",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-365" /> Pfeil oben links
      </span>
    ),
  },
  {
    value: "bottom",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-45" /> Pfeil oben
      </span>
    ),
  },
  {
    value: "bottomLeft",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-95" /> Pfeil oben rechts
      </span>
    ),
  },
  {
    value: "left",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-135" /> Pfeil rechts
      </span>
    ),
  },
  {
    value: "topLeft",
    label: (
      <span className="flex items-center gap-1.5">
        <TagIcon className="size-5 rotate-175" /> Pfeil unten rechts
      </span>
    ),
  },
]

export function RadiobuttonGroup({
  label,
  optional,
  disabled,
  items = labelPosItems,
  classLabelOverwrite,
  classNameItemWrapper,
  onChange,
  help,
}: RadiobuttonGroupProps) {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <div>
      {label !== undefined && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={clsx(classNameItemWrapper || "space-y-3")}>
        {items.map((item) => {
          const id = `${field.name}-${item.value}`

          return (
            <div key={item.value} className="flex break-inside-avoid items-center justify-start">
              <div className="flex h-5 items-center">
                <input
                  type="radio"
                  disabled={disabled}
                  checked={field.state.value === item.value}
                  id={id}
                  onChange={() => {
                    field.handleChange(item.value)
                    onChange?.(item.value)
                  }}
                  onBlur={field.handleBlur}
                  className={clsx(
                    "size-4 cursor-pointer",
                    hasError
                      ? "border-red-800 text-red-500 shadow-xs shadow-red-200 focus:ring-red-800"
                      : disabled
                        ? "border-gray-200 bg-gray-100 checked:bg-gray-500"
                        : "border-gray-300 text-blue-600 focus:ring-blue-500",
                  )}
                />
              </div>
              <label
                {...item.labelProps}
                htmlFor={id}
                className={clsx(
                  "block pl-3 text-sm font-medium whitespace-nowrap",
                  disabled ? "text-gray-400" : "cursor-pointer text-gray-700 hover:text-gray-900",
                )}
              >
                {item.label}
              </label>
            </div>
          )
        })}
      </div>
      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )
}

/** Preset for `labelPos` field — label position options for map markers. */
export function RadiobuttonGroupLabelPos() {
  return <RadiobuttonGroup label="" classNameItemWrapper="sm:columns-2" />
}
