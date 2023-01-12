import { Suspense } from "react"
import { Routes as PageRoutes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import get__ModelName__ from "src/__modelNamesPath__/queries/get__ModelName__"
import delete__ModelName__ from "src/__modelNamesPath__/mutations/delete__ModelName__"
import { Link, linkStyles } from "src/core/components/links"
import clsx from "clsx"
import { quote } from "src/core/components/text"

export const __ModelName__ = () => {
  const router = useRouter()
  const __modelId__ = useParam("__modelId__", "number")
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [delete__ModelName__Mutation] = useMutation(delete__ModelName__)
  const [__modelName__] = useQuery(get__ModelName__, { id: __modelId__ })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${__modelName__.id} unwiderruflich löschen?`)) {
      await delete__ModelName__Mutation({ id: __modelName__.id })
      if (process.env.parentModel) {
        await router.push(PageRoutes.__ModelNames__Page({ __parentModelId__: __parentModelId__! }))
      } else {
        await router.push(PageRoutes.__ModelNames__Page())
      }
    }
  }

  return (
    <>
      <h1>__ModelName__ {quote(__modelName__.id)}</h1>
      <pre>{JSON.stringify(__modelName__, null, 2)}</pre>

      <if condition="parentModel">
        <Link
          href={PageRoutes.Edit__ModelName__Page({
            __parentModelId__: __parentModelId__!,
            __modelId__: __modelName__.id,
          })}
        >
          Bearbeiten
        </Link>
        <else>
          <Link href={PageRoutes.Edit__ModelName__Page({ __modelId__: __modelName__.id })}>
            Bearbeiten
          </Link>
        </else>
      </if>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const Show__ModelName__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <LayoutArticle>
      <MetaTags noindex title={`__ModelName__ ${quote(__modelName__.id)}`} />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <__ModelName__ />
      </Suspense>

      <p>
        <if condition="parentModel">
          <Link href={PageRoutes.__ModelNames__Page({ __parentModelId__: __parentModelId__! })}>
            Alle __ModelNames__
          </Link>
          <else>
            <Link href={PageRoutes.__ModelNames__Page()}>Alle __ModelNames__</Link>
          </else>
        </if>
      </p>
    </LayoutArticle>
  )
}

Show__ModelName__Page.authenticate = true

export default Show__ModelName__Page
