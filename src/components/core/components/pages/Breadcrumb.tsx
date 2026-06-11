import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { Children, cloneElement, isValidElement } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"

type BreadcrumbProps = {
  children: React.ReactNode
  className?: string
}

export const Breadcrumb = ({ children, className }: BreadcrumbProps) => {
  const steps = Children.toArray(children)

  return (
    <nav aria-label="Breadcrumb" className={twJoin("flex", className)}>
      <ol role="list" className="flex items-center space-x-4">
        {steps.map((step, index) => {
          if (!isValidElement<BreadcrumbStepProps>(step)) return step
          return cloneElement(step, { key: step.key ?? index, isFirst: index === 0 })
        })}
      </ol>
    </nav>
  )
}

type BreadcrumbStepProps = {
  children: React.ReactNode
  to?: string
  params?: Record<string, string>
  isFirst?: boolean
}

export const BreadcrumbStep = ({ children, to, params, isFirst = false }: BreadcrumbStepProps) => {
  const content = to ? (
    <Link to={to} params={params} className="text-sm font-medium text-gray-500 hover:text-gray-700">
      {children}
    </Link>
  ) : (
    <span className="text-sm font-medium text-gray-500 select-none" aria-current="page">
      {children}
    </span>
  )

  if (isFirst) {
    return (
      <li>
        <div className="flex">{content}</div>
      </li>
    )
  }

  return (
    <li>
      <div className="flex items-center">
        <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
        <span className="ml-4">{content}</span>
      </div>
    </li>
  )
}
