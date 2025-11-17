import { DevAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { MetaTags } from "@/src/core/layouts"
import { isBrowser } from "@/src/core/utils/isEnv"
import { BlitzPage } from "@blitzjs/next"
import { z } from "zod"

declare global {
  interface Window {
    z: any
  }
}

const Zod: BlitzPage = () => {
  if (isBrowser) {
    // eslint-disable-next-line react-compiler/react-compiler
    window.z = z
  }

  return (
    <>
      <MetaTags noindex title="ZOD Test page" />
      <DevAdminBox>
        <div className="prose prose-lg">
          Use the browser console to test <Link href="https://zod.dev/">zod</Link> (
          <Link href="https://github.com/colinhacks/zod">Github</Link>).
        </div>
      </DevAdminBox>
    </>
  )
}

Zod.authenticate = true

export default Zod
