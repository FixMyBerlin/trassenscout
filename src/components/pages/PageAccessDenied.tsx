import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"

export function PageAccessDenied() {
  return (
    <>
      <PageHeader title="Zugriff verweigert" />
      <div className="prose mt-8 max-w-2xl">
        <p>
          Sie sind angemeldet, haben aber keinen Zugriff auf dieses Projekt. Bitte wenden Sie sich
          an einen Projekt-Administrator, falls Sie eine Einladung erwarten.
        </p>
        <p>
          <Link to="/dashboard">
            Zum Dashboard
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </p>
      </div>
    </>
  )
}
