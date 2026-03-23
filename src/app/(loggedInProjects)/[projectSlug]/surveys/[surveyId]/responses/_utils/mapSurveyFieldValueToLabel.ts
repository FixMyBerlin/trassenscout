type FieldConfig = {
  component?: string
  props?: {
    options?: Array<{ key: string | number; label: string }>
  }
}

type Props = {
  field: FieldConfig | undefined
  value: unknown
}

export const mapSurveyFieldValueToLabel = ({ field, value }: Props): string | string[] => {
  switch (field?.component) {
    case "SurveyCheckboxGroup": {
      const values = Array.isArray(value)
        ? value
        : typeof value === "string" && value.length > 0
          ? value.split(",").map((v) => v.trim())
          : value == null || value === ""
            ? []
            : [String(value)]

      return values.map((val) => {
        return field.props?.options?.find((opt) => String(opt.key) === String(val))?.label || String(val)
      })
    }

    case "SurveyRadiobuttonGroup":
    case "SurveySelect":
      return String(
        field.props?.options?.find((opt) => String(opt.key) === String(value))?.label || value || "",
      )

    default:
      if (Array.isArray(value)) {
        return value.map((v) => String(v))
      }
      return String(value || "")
  }
}
