import { clsx } from "clsx"

type Props = {
  className?: string
  children: React.ReactNode
}

export const PageDescription: React.FC<Props> = ({ className, children }) => {
  return (
    <section className={clsx(className, "mt-12 rounded-sm bg-gray-100 px-5 py-5")}>
      {children}
    </section>
  )
}
