export const fieldLayoutRootClassName = "field-layout"

export const fieldLayoutLabelClassName =
  "field-layout-label mb-1 block text-sm font-medium text-gray-700"

export const fieldLayoutControlClassName = "field-layout-control"

export const formFieldLayoutLabelsOnLeftClassName =
  "[&_.field-layout]:sm:grid [&_.field-layout]:sm:grid-cols-[18rem_minmax(0,1fr)] [&_.field-layout]:sm:items-start [&_.field-layout]:sm:gap-4 [&_.field-layout-label]:sm:mb-0 [&_.field-layout-control]:sm:mt-0"

/** Reset labels-on-left for a subtree still inside a FormShell form (e.g. review footer). */
export const fieldLayoutStackedOverrideClassName =
  "[&_.field-layout]:sm:!block [&_.field-layout-label]:sm:!mb-1"

export type FormFieldLayout = "stacked" | "labelsOnLeft"
