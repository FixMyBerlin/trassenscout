type Props = { startContent: React.ReactNode; disabled?: boolean }

export const Start = ({ startContent, disabled }: Props) => {
  return (
    <div>
      {startContent}
      {/* todo bb tbd */}
      {disabled && (
        <small className="text-red-500">
          Fehler: Die URL ist fehlerhaft oder unvollständig. Bitte überprüfen Sie den Link, den Sie
          per Email erhalten haben.
        </small>
      )}
    </div>
  )
}
