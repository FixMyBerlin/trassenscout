type GridProps = {
  buttonLeft1: React.ReactNode
  buttonLeft2?: React.ReactNode
  buttonRight1?: React.ReactNode
  buttonRight2?: React.ReactNode
}

export const SurveyButtonGrid = ({
  buttonLeft1,
  buttonLeft2,
  buttonRight1,
  buttonRight2,
}: GridProps) => {
  return (
    <div className="grid gap-6 pt-10 sm:grid-cols-2">
      {/* button position left */}
      <div>{buttonLeft1}</div>
      {/* button position right */}
      <div className="justify-end sm:flex">{buttonRight1}</div>
      {/* button position left */}
      <div>{buttonLeft2}</div>
      {/* button position right */}
      <div className="justify-end sm:flex">{buttonRight2}</div>
    </div>
  )
}
