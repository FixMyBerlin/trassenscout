import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

type AdminPageHeaderParent = {
  title: string
  href?: string
}

type Props = {
  title?: string
  parent?: AdminPageHeaderParent
  action?: ReactNode
}

export function AdminPageHeader({ title, parent, action }: Props) {
  if (!title && !action) return null

  return (
    <header className="mb-5 flex h-16 shrink-0 items-center justify-between gap-4">
      {title ? (
        <h1 className="flex min-w-0 items-center gap-2.5 text-3xl font-semibold text-gray-900">
          {parent ? (
            <>
              {parent.href ? (
                <Link
                  to={parent.href}
                  className="truncate font-medium text-gray-500 hover:text-gray-700"
                >
                  {parent.title}
                </Link>
              ) : (
                <span className="truncate font-medium text-gray-500">{parent.title}</span>
              )}
              <span className="shrink-0 font-normal text-gray-400" aria-hidden="true">
                &gt;
              </span>
            </>
          ) : null}
          <span className="truncate">{title}</span>
        </h1>
      ) : (
        <div />
      )}
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  )
}
