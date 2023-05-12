type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const SubsectionIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-9 w-12 flex-none
        cursor-pointer items-center justify-center rounded-lg
        border-2 border-gray-900 bg-gray-900 pt-0.5
        font-sans text-xl font-bold leading-none text-white`}
    {...props}
  >
    {label}
  </div>
)

export const SubsectionMapIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-[21px] w-[34px] flex-none
        cursor-pointer items-center justify-center rounded-lg
        border-2 border-gray-900 bg-gray-900 pt-0.5
        font-sans text-[12py] font-bold leading-none text-white`}
    {...props}
  >
    {label}
  </div>
)
