import { BlitzLayout } from "@blitzjs/next"

type Props = {
  children?: React.ReactNode
}

export const SurveyContainer: BlitzLayout<Props> = ({ children }) => {
  return <div className="mx-auto w-full max-w-3xl px-3">{children}</div>
}
