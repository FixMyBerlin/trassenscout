type Props = {
  icon: React.ReactNode
  title?: string | null
}

export const TitleLabel = ({ icon, title }: Props) => {
  return (
    <div className="p-1.5">
      <div className="flex items-center">
        <div className="flex items-center">{icon}</div>
        {title && (
          <div className="ml-1.5 line-clamp-2 w-max max-w-52 text-xs leading-4 whitespace-normal">
            {title}
          </div>
        )}
      </div>
    </div>
  )
}
