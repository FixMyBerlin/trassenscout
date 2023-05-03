type Props = {
  label: string
  isInteractive?: boolean
}

export const SubsectionMarker: React.FC<Props> = ({ label }) => {
  return (
    <div
      className={`flex h-9 w-12 flex-none
        cursor-pointer items-center justify-center rounded-lg
        border-2 border-gray-900 bg-gray-900 pt-0.5
        font-sans text-xl font-bold leading-none text-white`}
    >
      {label}
    </div>
  )
}
