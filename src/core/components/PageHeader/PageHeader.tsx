type Props = {
  title: string
  subtitle?: string | null
  description?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, description, action }) => {
  return (
    <section className="my-12">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {Boolean(action) && <div>{action}</div>}
      </div>
      {Boolean(subtitle) && <h3 className="mt-0 text-2xl font-bold text-gray-900">{subtitle}</h3>}
      {Boolean(description) && <p className="mt-0 text-base text-gray-500">{description}</p>}
      <div className="bg-dashed-line mt-10 h-[1px]" />
    </section>
  )
}
