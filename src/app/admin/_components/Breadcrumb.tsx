"use client"
import { HomeIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { Route } from "next"
import Link from "next/dist/client/link"

import { usePathname } from "next/navigation"

export type TBreadcrumb = { name: string; href?: Route | string }
type Props = { pages: TBreadcrumb[] }

export const Breadcrumb = ({ pages }: Props) => {
  const pathname = usePathname()

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="my-0 flex space-x-4 rounded-md bg-white px-6 shadow">
        <li className="flex">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Meine Projekte (Öffentliche Ansicht)</span>
            </Link>
          </div>
        </li>

        {pages.map((page) => {
          const current = pathname === page.href

          return (
            <li key={page.name} className="flex">
              <div className="flex items-center">
                <svg
                  className="h-full w-6 flex-shrink-0 text-gray-200"
                  viewBox="0 0 24 44"
                  preserveAspectRatio="none"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                </svg>
                {page.href ? (
                  <Link
                    href={page.href}
                    aria-disabled={current ? "true" : undefined}
                    className={clsx(
                      current
                        ? "pointer-events-none font-semibold text-gray-800"
                        : "font-medium text-gray-500 hover:text-gray-700",
                      "ml-4 text-sm",
                    )}
                    aria-current={current ? "page" : undefined}
                  >
                    {page.name}
                  </Link>
                ) : (
                  <span className="ml-4 text-sm font-medium text-gray-500">{page.name}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
