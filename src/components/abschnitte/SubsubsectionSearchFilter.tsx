import { PageHeaderSearchFilter } from "@/src/components/core/components/PageHeader/PageHeaderSearchFilter"
import { useSubsubsectionSearch } from "./useSubsubsectionSearch"

type Props = {
  placeholder: string
  resetLabel?: string
  onSubmit?: (value: string) => void
}

export const SubsubsectionSearchFilter = ({ placeholder, resetLabel, onSubmit }: Props) => {
  const { searchterm, setSearchterm } = useSubsubsectionSearch()

  return (
    <PageHeaderSearchFilter
      singleLine
      value={searchterm}
      onChange={setSearchterm}
      onReset={() => setSearchterm("")}
      hasFilter={Boolean(searchterm)}
      placeholder={placeholder}
      resetLabel={resetLabel}
      onSubmit={onSubmit}
    />
  )
}
