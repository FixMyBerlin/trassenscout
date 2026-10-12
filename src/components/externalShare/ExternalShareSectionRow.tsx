type Props = {
  title: string
  count: number
  action?: React.ReactNode
}

export const ExternalShareSectionRow = ({ title, count, action }: Props) => (
  <div className="flex min-h-14 items-center justify-between gap-4 border-b border-gray-200 px-4 py-2">
    <h2 className="text-sm font-medium text-gray-900">
      {title} ({count})
    </h2>
    {action}
  </div>
)
