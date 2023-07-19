import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, __ModelName__Form } from "src/__modelNamesPath__/components/__ModelName__Form"
import update__ModelName__ from "src/__modelNamesPath__/mutations/update__ModelName__"
import get__ModelName__ from "src/__modelNamesPath__/queries/get__ModelName__"

const Edit__ModelName__ = () => {
  const router = useRouter()
  const __modelId__ = useParam("__modelId__", "number")
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }
  const [__modelName__, { setQueryData }] = useQuery(
    get__ModelName__,
    { id: __modelId__ },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [update__ModelName__Mutation] = useMutation(update__ModelName__)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await update__ModelName__Mutation({
        id: __modelName__.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        process.env.parentModel
          ? Routes.Show__ModelName__Page({
              __parentModelId__: __parentModelId__!,
              __modelId__: updated.id,
            })
          : Routes.Show__ModelName__Page({ __modelId__: updated.id }),
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`__ModelName__ ${__modelName__.id} bearbeiten`} />

      <h1>__ModelName__ {__modelName__.id} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(__modelName__, null, 2)}</pre>
      </SuperAdminBox>

      <__ModelName__Form
        submitText="Speichern"
        // TODO use a zod schema for form validation
        // 1. Move the schema from mutations/create__ModelName__.ts to `__ModelName__/schema.ts`
        //   - Name `__ModelName__Schema`
        // 2. Import the zod schema here.
        // 3. Update the mutations/update__ModelName__.ts to
        //   `const Update__ModelName__Schema = __ModelName__Schema.merge(z.object({id: z.number(),}))`
        // schema={__ModelName__Schema}
        initialValues={__modelName__}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const Edit__ModelName__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam("__parentModelId__", "number")
  }

  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <Edit__ModelName__ />
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

Edit__ModelName__Page.authenticate = true

export default Edit__ModelName__Page
