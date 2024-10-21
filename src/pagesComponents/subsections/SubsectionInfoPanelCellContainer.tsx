type Props = {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

export const SubsectionInfoPanelCellContainer: React.FC<Props> = ({ icon, title, children }) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-start gap-1">
        {icon}
        <h3 className="strong font-semibold">{title}</h3>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}
