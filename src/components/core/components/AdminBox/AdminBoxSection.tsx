import { clsx } from "clsx"

type AdminBoxSectionProps = {
  title: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const AdminBoxSection = ({ title, actions, children, className }: AdminBoxSectionProps) => (
  <section className={clsx("flex flex-col gap-4", className)}>
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
    {children}
  </section>
)
