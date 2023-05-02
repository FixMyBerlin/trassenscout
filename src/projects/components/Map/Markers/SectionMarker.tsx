import clsx from "clsx"

type Props = {
  label: string
  isInteractive?: boolean
}

export const SectionMarker: React.FC<Props> = ({ label, isInteractive }) => {
  return (
    <div
      className={clsx(
        { "cursor-pointer": isInteractive },
        `flex h-9 w-12
        flex-none items-center justify-center rounded-lg
        border-2 border-yellow-500 bg-white pt-0.5
        font-sans text-xl font-bold leading-none text-gray-900`
      )}
    >
      {label}
    </div>
  )
}
