import clsx from "clsx"

type Props = {
  number: number
  isInteractive?: boolean
}

export const SectionMarker: React.FC<Props> = ({ number, isInteractive }) => {
  return (
    <div
      className={clsx(
        { "cursor-pointer": isInteractive },
        "flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-rsv-ochre bg-white pt-0.5 font-sans text-xl font-bold leading-none"
      )}
    >
      {number}
    </div>
  )
}
