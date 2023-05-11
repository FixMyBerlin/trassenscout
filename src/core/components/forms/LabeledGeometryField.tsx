import { ErrorMessage } from "@hookform/error-message"
import clsx from "clsx"
import { ComponentPropsWithoutRef, forwardRef, PropsWithoutRef, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { LabeledGeometryFieldPreview } from "./LabeledGeometryFieldPreview"

export interface LabeledTextareaProps extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  help?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  optional?: boolean
}

export const LabeledGeometryField = forwardRef<HTMLTextAreaElement, LabeledTextareaProps>(
  (
    { name, label, help, outerProps, labelProps, optional, className: textareaClasName, ...props },
    ref
  ) => {
    const {
      register,
      formState: { isSubmitting, errors },
      setValue,
      watch,
    } = useFormContext()

    const value = watch(name)
    const [valueString, setValueString] = useState("")
    useEffect(() => {
      setValueString(JSON.stringify(value, undefined, 2))
    }, [value])

    const [hasJsonParseError, setJsonParseError] = useState(false)
    const hasError = Boolean(errors[name])

    // Convert the JSON value to a string
    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = undefined
      try {
        newValue = JSON.parse(event.target.value)
        setJsonParseError(false)
      } catch (error) {
        setJsonParseError(true)
        console.error("ERROR in LabeledGeometryField", error, JSON.stringify(event.target.value))
      }

      newValue && setValue(name, newValue, { shouldValidate: true })
    }

    return (
      <div {...outerProps}>
        <label
          {...labelProps}
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
          {optional && <> (optional)</>}
        </label>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <textarea
              disabled={isSubmitting}
              {...register(name)}
              id={name}
              {...props}
              value={valueString}
              onFocus={handleTextareaChange}
              onChange={handleTextareaChange}
              onBlur={handleTextareaChange}
              onSubmit={handleTextareaChange}
              className={clsx(
                textareaClasName,
                "block h-full w-full rounded-md shadow-sm sm:text-sm",
                hasError
                  ? "border-red-800 shadow-red-200 focus:border-red-800 focus:ring-red-800"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              )}
            />
            {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
          </div>
          <div>
            <ErrorMessage
              render={({ message }) => (
                <div role="alert" className="text-sm text-red-800">
                  {message}
                </div>
              )}
              errors={errors}
              name={name}
            />
            {hasJsonParseError && (
              <div role="alert" className="mb-3 rounded bg-red-800 p-3 text-sm text-white">
                Es ist ein Fehler beim Verarbeiten der Geometrie aufgetreten. Die Änderung wurde
                daher verworfen. Es könnte sein, dass ein Syntaxfehler vorlag, bspw. durch ein Komma
                zu viel/wenig.
              </div>
            )}
            <LabeledGeometryFieldPreview name={name} hasError={hasJsonParseError || hasError} />
          </div>
        </div>
      </div>
    )
  }
)
