type Props = {
  icon: React.ReactNode
}

export const MarkerLabel = ({ icon }: Props) => (
  <div className="px-1.5 py-1">
    <div className="flex items-center gap-1.5">
      <div className="flex flex-col items-center leading-4">
        <div className="flex items-center">{icon}</div>
      </div>
    </div>
  </div>
)
