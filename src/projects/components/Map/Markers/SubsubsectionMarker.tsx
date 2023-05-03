type Props = {
  label: string
}

export const SubsubsectionMarker: React.FC<Props> = ({ label }) => {
  return (
    <div
      className={`flex h-9 w-12 flex-none
        cursor-pointer items-center justify-center rounded-lg
        border-2 border-gray-900 bg-white pt-0.5
        font-sans text-xl font-bold leading-none text-gray-900`}
    >
      {label}
    </div>
  )
}
