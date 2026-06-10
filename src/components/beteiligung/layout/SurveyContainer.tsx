type Props = {
  children?: React.ReactNode
}

export const SurveyContainer = ({ children }: Props) => {
  return <div className="mx-auto w-full max-w-3xl px-3">{children}</div>
}
