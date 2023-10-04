import { Layout, MetaTags } from "src/core/layouts"
import { NewsItem } from "./news/NewsItem"
import { newsItems } from "./news/newsItems.const"
import { PageHomePublicContact } from "./PageHomePublicContact"
import PageHomePublicOnline from "./PageHomePublicOnline"
import { PageHomePublicPhotos } from "./PageHomePublicPhotos"

const PageHomePublic = () => {
  return (
    <Layout navigation="general" footer="general" fullWidth>
      <MetaTags title="Trassenscout" />

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">
        <div className="max-w-2xl">
          <h1 className="mt-20 text-4xl font-semibold tracking-tight text-gray-800 sm:text-5xl">
            Trassenscout findet Wege
          </h1>
          <div className="prose mt-6">
            <p>
              Der Trassenscout unterstützt Kommunen und Regionalverbände bei der Erstellung von
              Machbarkeitsstudien und Vorplanungen für Radschnellverbindungen und anderer
              liniengebundener Bauwerken.
            </p>
            <p>
              Der Trassenscout bindet Akteure über kommunale Grenzen hinaus konstruktiv in
              Abstimmungsprozesse ein. Dabei wollen Träger öffentlicher Belange, Umwelt- und
              Bauernverbände sowie interne wie externe Stakeholder unterschiedlich mitgenommen
              werden.
            </p>
            <p>
              Für die Durchführung öffentlicher Beteiligungen bietet der Trassenscout einfach
              verständliche und konfigurierbare Formulare zur Abbildung von Beteiligungsverfahrens
              an, die Sie anschließend komfortabel auswerten können.
            </p>
            <p>
              Gleichzeitig müssen Sie mit Ihrem Projektteam auf einer aktuellen Datenbasis die
              nächsten Schritte planen und sich koordinieren können. Bei diesen Aufgaben unterstützt
              Sie der Trassenscout.
            </p>
          </div>
        </div>
      </section>

      <PageHomePublicPhotos />

      <section className="mx-auto mt-16 w-full max-w-7xl px-6 pb-16 md:px-8">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-12 lg:max-w-none lg:grid-cols-2 lg:gap-y-20">
          <div className="flex flex-col gap-16">
            {newsItems.map((newsItem) => (
              <NewsItem key={newsItem.slug} article={newsItem} />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <PageHomePublicContact />
            {/* <Newsletter />
            <Resume /> */}
            <PageHomePublicOnline />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default PageHomePublic
