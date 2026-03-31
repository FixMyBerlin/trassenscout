type FieldConfig = {
  component?: string
  props?: {
    options?: Array<{ key: string | number; label: string }>
    label?: string
  }
}

type SurveyFieldValueProps = {
  field: FieldConfig | undefined
  value: unknown
  /** What to display for empty/null values. Defaults to "-" */
  emptyLabel?: React.ReactNode
}

export const SurveyResponseFieldValue = ({
  field,
  value,
  emptyLabel = "-",
}: SurveyFieldValueProps) => {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <>{emptyLabel}</>
  }

  switch (field?.component) {
    case "SurveyCheckboxGroup":
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc pl-5">
            {(value as string[]).map((val) => {
              const label =
                field.props?.options?.find((opt) => String(opt.key) === String(val))?.label || val
              return <li key={val}>{label}</li>
            })}
          </ul>
        )
      }
      return <>{String(value)}</>

    case "SurveyRadiobuttonGroup":
    case "SurveySelect": {
      const selectLabel =
        field.props?.options?.find((opt) => String(opt.key) === String(value))?.label || value
      return <span>{String(selectLabel)}</span>
    }

    case "SurveyTextfield":
    case "SurveyReadonlyTextfield":
    case "SurveyResponseIdField":
    case "SurveyVorgangsIdField":
    case "SurveyTextarea":
      return <span>{String(value)}</span>

    case "SurveyNumberfield":
      return <span>{typeof value === "number" ? value : String(value)}</span>

    case "SurveyCheckbox":
      return <span>{value ? "Ja" : "Nein"}</span>

    case "SurveySimpleMapWithLegend":
    case "SurveyGeoCategoryMapWithLegend":
    case "SwitchableMapWithLegend":
      return (
        <pre className="overflow-x-auto rounded-sm bg-gray-100 p-2 text-sm text-black">
          {JSON.stringify(value, null, 2)}
        </pre>
      )

    case "SurveyUploadField":
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc pl-5">
            {(value as any[]).map((file, idx) => (
              <li key={idx}>
                {typeof file === "string" ? file : file.name || JSON.stringify(file)}
              </li>
            ))}
          </ul>
        )
      }
      return <span>{typeof value === "string" ? value : JSON.stringify(value)}</span>

    default:
      // Fallback for unknown field types or when field is not found
      if (Array.isArray(value)) {
        return <>{(value as string[]).join(", ")}</>
      }
      return <span>{String(value)}</span>
  }
}
