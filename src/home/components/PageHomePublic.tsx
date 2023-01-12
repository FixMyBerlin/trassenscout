import { Routes } from "@blitzjs/next"
import { Link } from "src/core/components/links"
import { Layout, MetaTags } from "src/core/layouts"

const PageHomePublic = () => {
  return (
    <Layout>
      <MetaTags title="TODO Homepage Public" />
      Public homepage
      <p>
        <Link href={Routes.SignupPage()}>Registrieren</Link>
      </p>
      <p>
        <Link href={Routes.LoginPage()}>Anmelden</Link>
      </p>
    </Layout>
  )
}

export default PageHomePublic
