import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"

type Props = {
  icon: React.ReactNode
  title?: string | null
  subtitle?: string | null
}

export const TitleLabel = ({ icon, title, subtitle }: Props) => {
  const content = [title, subtitle].filter(Boolean).join("\n")
  return (
    <Tooltip content={content}>
      <div className="p-1.5">
        <div className="flex">
          <div className="flex items-center">{icon}</div>
          <div className="ml-1.5 text-[14px] leading-4">
            {title && <div className="max-w-52 truncate">{title}</div>}
            {subtitle && <div className="max-w-52 truncate text-gray-500">{subtitle}</div>}
          </div>
        </div>
      </div>
    </Tooltip>
  )
}
