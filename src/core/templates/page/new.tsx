import { Routes } from "@blitzjs/next"
if (process.env.parentModel) {
  import { useParam } from "@blitzjs/next"
  import { useRouter } from "next/router"
  import { useMutation } from "@blitzjs/rpc"
} else {
  import { useRouter } from "next/router"
  import { useMutation } from "@blitzjs/rpc"
}
import { LayoutArticle, MetaTags } from "src/core/layouts"
import create__ModelName__ from "src/__modelNamesPath__/mutations/create__ModelName__"
import { __ModelName__Form, FORM_ERROR } from "src/__modelNamesPath__/components/__ModelName__Form"
import { Link } from "src/core/components/links"
import { Suspense } from "react"

const New__ModelName__ = () => {
  const router = useRouter()
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [create__ModelName__Mutation] = useMutation(create__ModelName__)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const __modelName__ = await create__ModelName__Mutation(
        process.env.parentModel ? { ...values, __parentModelId__: __parentModelId__! } : values
      )
      await router.push(
        process.env.parentModel
          ? Routes.Show__ModelName__Page({
              __parentModelId__: __parentModelId__!,
              __modelId__: __modelName__.id,
            })
          : Routes.Show__ModelName__Page({ __modelId__: __modelName__.id })
      )
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen __ModelName__ erstellen" />

      <h1>Neuen __ModelName__ erstellen</h1>

      <if condition="parentModel">
        <__ModelName__Form
          submitText="Erstellen"
          // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
          // schema={__ModelName__Schema.omit({ __parentModelId__: true })}
          // initialValues={{}} // Use only when custom initial values are needed
          onSubmit={handleSubmit}
        />
        <else>
          <__ModelName__Form
            submitText="Erstellen"
            // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
            // schema={__ModelName__Schema}
            // initialValues={{}} // Use only when custom initial values are needed
            onSubmit={handleSubmit}
          />
        </else>
      </if>
    </>
  )
}

const New__ModelName__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <New__ModelName__ />
      </Suspense>

      <p>
        <if condition="parentModel">
          <Link href={Routes.__ModelNames__Page({ __parentModelId__: __parentModelId__! })}>
            Alle __ModelNames__
          </Link>
          <else>
            <Link href={Routes.__ModelNames__Page()}>Alle __ModelNames__</Link>
          </else>
        </if>
      </p>
    </LayoutArticle>
  )
}

New__ModelName__Page.authenticate = true

export default New__ModelName__Page
