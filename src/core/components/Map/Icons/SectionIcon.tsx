type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const SectionIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-9 w-12 flex-none
        items-center justify-center rounded-lg
        border-2 border-yellow-500 bg-white pt-0.5
        font-sans text-xl font-bold leading-none text-gray-900`}
    {...props}
  >
    {label}
  </div>
)

export const SectionMapIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-[21px] w-[34px] flex-none
        items-center justify-center rounded-lg
        border-2 border-yellow-500 bg-white pt-0.5
        font-sans text-[12px] font-bold leading-none text-gray-900`}
    {...props}
  >
    {label}
  </div>
)
