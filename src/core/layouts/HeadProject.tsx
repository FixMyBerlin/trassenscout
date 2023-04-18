import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import Head from "next/head"
import { Suspense } from "react"
import getProject from "src/projects/queries/getProject"
import { getImageSrc } from "../utils/getImageSrc"

export const HeadProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })

  if (!project.logoSrc)
    return (
      <Head>
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>
    )

  return (
    <Head>
      <link rel="icon" href={getImageSrc(project.logoSrc)} />
    </Head>
  )
}

export const HeadProject = () => {
  return (
    <Suspense>
      <HeadProjectWithQuery />
    </Suspense>
  )
}
