import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import Head from "next/head"
import { Suspense } from "react"
import getProject from "src/projects/queries/getProject"
import { Spinner } from "../components/Spinner"

export const HeadProjectWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })

  if (!project.logo)
    return (
      <Head>
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      </Head>
    )

  const extension = new URL(project.logo).pathname.split(".").at(-1)
  const mimetype =
    { ico: "image/x-icon", svg: "image/svg+xml", jpg: "image/jpeg" }[extension!] ||
    `image/${extension}`

  return <Head>{project.logoSrc && <link rel="icon" href={project.logo} type={mimetype} />}</Head>
}

export const HeadProject = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <HeadProjectWithQuery />
    </Suspense>
  )
}
