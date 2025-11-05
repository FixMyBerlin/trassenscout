type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const SubsubsectionIcon = ({ label, ...props }: Props) => (
  <div
    className="flex h-9 w-auto flex-none items-center justify-center rounded-lg border-2 border-gray-900 bg-white px-1.5 font-sans text-xl leading-none font-semibold text-gray-900"
    {...props}
  >
    {label}
  </div>
)

export const SubsubsectionMapIcon = ({ label, ...props }: Props) => (
  <div
    className="flex h-5 w-auto flex-none items-center justify-center rounded-md border-2 border-gray-900 bg-white px-1.5 font-sans text-xs leading-none font-semibold text-gray-900"
    {...props}
  >
    {label}
  </div>
)
