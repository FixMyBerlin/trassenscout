import { Description, Field, Label, Select } from "@headlessui/react"
import { useMap } from "react-map-gl/maplibre"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  useFieldHasVisibleError,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import type { SurveyMapArea } from "@/src/components/beteiligung/form/map/utils"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type SelectProps = {
  description?: string
  required: boolean
  label: string
  placeholder?: string
  options: { key: string; label: string }[]
  // Choosing an option frames the survey map (SwitchableMap) on the area with that id.
  mapBounds?: SurveyMapArea[]
}

export const SurveySelect = ({
  description,
  label,
  options,
  placeholder,
  required,
  mapBounds,
}: SelectProps) => {
  const field = useFieldContext<string>()
  const hasError = useFieldHasVisibleError(field)
  const { mainMap } = useMap()

  const handleChange = (value: string) => {
    field.handleChange(value)
    const bbox = mapBounds?.find((area) => area.id === value)?.bbox
    if (bbox) mainMap?.fitBounds(bbox, { padding: 70 })
  }

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <Field>
        <div className="mb-4">
          <Label htmlFor={field.name} className={formClasses.fieldLabel}>
            {label} {!required && "(optional)"}
          </Label>
          {description && (
            <Description
              id={getFieldDescriptionId(field.name)}
              className={formClasses.fieldDescription}
            >
              {description}
            </Description>
          )}
        </div>
        <Select
          id={field.name}
          name={field.name}
          invalid={hasError}
          value={field.state.value}
          onChange={(e) => handleChange(e.target.value)}
          aria-label={label}
          className={`block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-xs data-disabled:bg-gray-100 sm:text-sm ${formClasses.fieldFocus}`}
          {...getFieldA11yProps({ description, fieldName: field.name, hasError, required })}
        >
          {placeholder && (
            <option disabled value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
