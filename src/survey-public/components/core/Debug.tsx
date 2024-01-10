type Props = {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLDivElement>

export const Debug: React.FC<Props> = ({ children, ...props }) => {
  // return <div {...props}>{children}</div>
  return null
}
