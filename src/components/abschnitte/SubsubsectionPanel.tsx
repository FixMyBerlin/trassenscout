import { twJoin } from "tailwind-merge"

type Props = {
  title: string
  action?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export const SubsubsectionPanel = ({
  title,
  action,
  header,
  children,
  className,
  contentClassName,
}: Props) => {
  return (
    <section
      className={twJoin(
        "flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {header ?? (
        <div className="flex items-center justify-between gap-3 px-1 pt-1 pb-2">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          {action}
        </div>
      )}

      <div className={contentClassName}>{children}</div>
    </section>
  )
}
