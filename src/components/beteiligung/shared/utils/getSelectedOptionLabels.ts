type FieldWithOptions = {
  props?: unknown
}

/**
 * Labels of the options picked in a field with `props.options` (radio, select, checkbox group).
 * Stored answers are option keys; emails and exports should show the labels. A key without a
 * matching option is kept as is. Returns `undefined` for fields without options.
 */
export const getSelectedOptionLabels = (field: FieldWithOptions | undefined, value: unknown) => {
  const options = (field?.props as { options?: { key: string | number; label: string }[] })?.options
  if (!options) return undefined

  const selectedValues = Array.isArray(value) ? value : value != null && value !== "" ? [value] : []

  return selectedValues.map((selectedValue) => {
    const normalizedValue = String(selectedValue).trim()
    return options.find((opt) => String(opt.key) === normalizedValue)?.label || normalizedValue
  })
}
