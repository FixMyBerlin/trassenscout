import { DevAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { isBrowser } from "@/src/core/utils"
import { BlitzPage } from "@blitzjs/next"
import { z } from "zod"

declare global {
  interface Window {
    z: any
  }
}

const Zod: BlitzPage = () => {
  if (isBrowser) {
    window.z = z
  }

  return (
    <LayoutMiddleBox>
      <MetaTags noindex title="ZOD Test page" />
      <DevAdminBox>
        <div className="prose prose-lg">
          Use the browser console to test <Link href="https://zod.dev/">zod</Link> (
          <Link href="https://github.com/colinhacks/zod">Github</Link>).
        </div>
      </DevAdminBox>
    </LayoutMiddleBox>
  )
}

Zod.authenticate = true

export default Zod
