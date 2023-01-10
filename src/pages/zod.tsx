import { BlitzPage } from "@blitzjs/next"
import Link from "next/link"
import { Layout, MetaTags } from "src/core/layouts"
import { z } from "zod"

declare global {
  interface Window {
    z: any
  }
}

const Zod: BlitzPage = () => {
  if (typeof window !== "undefined") {
    window.z = z
  }

  return (
    <Layout>
      <MetaTags noindex title="ZOD Test page" />
      <p>
        Use the browser console to test <Link href="https://zod.dev/">zod</Link> (
        <Link href="https://github.com/colinhacks/zod">Github</Link>).
      </p>
    </Layout>
  )
}

export default Zod
