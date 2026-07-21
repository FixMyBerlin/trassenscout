type Props = {
  icon: React.ReactNode
  title?: string | null
  subtitle?: string | null
}

export const TitleLabel = ({ icon, title, subtitle }: Props) => {
  return (
    <div className="p-1.5">
      <div className="flex items-center">
        <div className="flex items-center">{icon}</div>
        <div className="ml-1.5 flex flex-col justify-center text-[14px] leading-4">
          {title && <div className="max-w-52 truncate">{title}</div>}
          {subtitle && <div className="max-w-52 truncate text-gray-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  )
}
