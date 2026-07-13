import { twJoin } from "tailwind-merge"

type AdminBoxSectionProps = {
  title: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const AdminBoxSection = ({ title, actions, children, className }: AdminBoxSectionProps) => (
  <section className={twJoin("not-prose flex flex-col gap-2", className)}>
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-xs font-semibold">{title}</h2>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
    {children}
  </section>
)
