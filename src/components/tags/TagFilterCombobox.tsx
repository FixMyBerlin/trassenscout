import { ComboboxSingleBase } from "@/src/components/core/components/forms/ComboboxSingleBase"
import { getTagFilterSelection } from "./tagFilterOptions"

const ALL_TAGS = ""

type Props = {
  tags: string[]
  value: string | undefined
  onChange: (tag: string | undefined) => void
}

export function TagFilterCombobox({ tags, value, onChange }: Props) {
  const { selected, titles } = getTagFilterSelection(tags, value)
  const items = [
    { value: ALL_TAGS, searchText: "Alle Tags", label: "Alle Tags" },
    ...titles.map((title) => ({ value: title, searchText: `#${title}`, label: `#${title}` })),
  ]

  return (
    <div className="w-56 max-w-full">
      <ComboboxSingleBase
        value={selected ?? ALL_TAGS}
        onChange={(next) => onChange(next || undefined)}
        items={items}
        placeholder="Tags durchsuchen"
        buttonSrLabel="Nach Tag filtern"
      />
    </div>
  )
}
