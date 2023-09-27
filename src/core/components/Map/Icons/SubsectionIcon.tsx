type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const SubsectionIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-9 w-auto flex-none
        items-center justify-center rounded-lg
        border-2 border-gray-900 bg-gray-900 px-1.5
        font-sans text-xl font-bold leading-none text-white`}
    {...props}
  >
    {label}
  </div>
)

export const SubsectionMapIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-5 w-auto flex-none
        items-center justify-center rounded-md
        border-2 border-gray-900 bg-gray-900 px-1.5
        font-sans text-xs font-bold leading-none text-white`}
    {...props}
  >
    {label}
  </div>
)
