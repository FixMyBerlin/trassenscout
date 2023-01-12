import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
if (process.env.parentModel) {
  import { usePaginatedQuery } from "@blitzjs/rpc"
  import { useParam } from "@blitzjs/next"
  import { useRouter } from "next/router"
} else {
  import { usePaginatedQuery } from "@blitzjs/rpc"
  import { useRouter } from "next/router"
}
import { LayoutArticle, MetaTags } from "src/core/layouts"
import get__ModelNames__ from "src/__modelNamesPath__/queries/get__ModelNames__"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"

const ITEMS_PER_PAGE = 100

export const __ModelNames__List = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
    const [{ __modelNames__, hasMore }] = usePaginatedQuery(get__ModelNames__, {
      where: { __parentModel__: { id: __parentModelId__! } },
      orderBy: { id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    })

    const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
    const goToNextPage = () => router.push({ query: { page: page + 1 } })

    return (
      <>
        <ul>
          {__modelNames__.map((__modelName__) => (
            <li key={__modelName__.id}>
              <Link href={Routes.Show__ModelName__Page({ __modelId__: __modelName__.id })}>
                {__modelName__.name}
              </Link>
            </li>
          ))}
        </ul>

        <button disabled={page === 0} onClick={goToPreviousPage}>
          Previous
        </button>
        <button disabled={!hasMore} onClick={goToNextPage}>
          Next
        </button>
      </>
    )
  } else {
    const [{ __modelNames__, hasMore }] = usePaginatedQuery(get__ModelNames__, {
      orderBy: { id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    })

    const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
    const goToNextPage = () => router.push({ query: { page: page + 1 } })

    return (
      <>
        <h1>__ModelNames__</h1>

        <p>
          <if condition="parentModel">
            <Link href={Routes.New__ModelName__Page({ __parentModelId__: __parentModelId__! })}>
              __ModelName__ erstellen
            </Link>
            <else>
              <Link href={Routes.New__ModelName__Page()}>__ModelName__ erstellen</Link>
            </else>
          </if>
        </p>

        <ul>
          {__modelNames__.map((__modelName__) => (
            <li key={__modelName__.id}>
              <if condition="parentModel">
                <Link
                  href={Routes.Show__ModelName__Page({
                    __parentModelId__: __parentModelId__!,
                    __modelId__: __modelName__.id,
                  })}
                >
                  {__modelName__.name}
                </Link>
                <else>
                  <Link href={Routes.Show__ModelName__Page({ __modelId__: __modelName__.id })}>
                    {__modelName__.name}
                  </Link>
                </else>
              </if>
            </li>
          ))}
        </ul>

        <Pagination
          visible={!hasMore || page !== 0}
          disablePrev={page === 0}
          disableNext={!hasMore}
          handlePrev={goToPreviousPage}
          handleNext={goToNextPage}
        />
      </>
    )
  }
}

const __ModelNames__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <LayoutArticle>
      <MetaTags noindex title="__ModelNames__" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <__ModelNames__List />
      </Suspense>
    </LayoutArticle>
  )
}

export default __ModelNames__Page
