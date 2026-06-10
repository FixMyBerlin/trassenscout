type Props = {
  label: string
  children: React.ReactNode
}

export const FormElementWrapper = ({ label, children }: Props) => {
  return (
    <div>
      <p className="mb-3 font-semibold">{label}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}
