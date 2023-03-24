import clsx from "clsx"
import { useContext } from "react"
import { pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { ProgressContext } from "src/pages/beteiligung"
import { TButton } from "../survey/Page"
export { FORM_ERROR } from "src/core/components/forms"

export type TParticipationButton = {
  button: TButton
  disabled?: boolean
}

export const ParticipationButton: React.FC<TParticipationButton> = ({
  disabled,
  button,
  // buttonActions,
}) => {
  const { progress, setProgress } = useContext(ProgressContext)
  const { label, color, onClick } = button
  const buttonStyles = clsx("px-12", color === "white" ? whiteButtonStyles : pinkButtonStyles)

  if (onClick.action === "submit")
    return (
      <button disabled={disabled} type="submit" className={buttonStyles}>
        {label.de}
      </button>
    )

  let buttonAction: any
  // TODO
  switch (onClick.action) {
    case "reset":
      buttonAction = () => {}
      break
    case "previousPage":
      buttonAction = () => {
        const newCurrent = progress.current > 1 ? progress.current - 1 : 1
        setProgress({ ...progress, current: newCurrent })
        window && window.scrollTo(0, 0)
        console.log(newCurrent)
      }
      break
    case "nextPage":
      buttonAction = () => {
        const newCurrent = progress.current < progress.total ? progress.current + 1 : progress.total
        setProgress({ ...progress, current: newCurrent })
        window && window.scrollTo(0, 0)
        console.log(newCurrent)
      }
  }

  return (
    <button disabled={disabled} type="button" className={buttonStyles} onClick={buttonAction}>
      {label.de}
    </button>
  )
}
