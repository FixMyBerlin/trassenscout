type Props = {
  children: React.ReactNode
}

export const PageDescription: React.FC<Props> = ({ children }) => {
  return <section className="mt-12 rounded bg-gray-100 py-5 px-5">{children}</section>
}
