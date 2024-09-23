import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import "server-only"
import { MarketingPageContact } from "./_components/MarketingPageContact"
import { MarketingPageLinks } from "./_components/MarketingPageLinks"
import { MarketingPagePhotos } from "./_components/MarketingPagePhotos"
import { NewsItem } from "./_components/news/NewsItem"
import { newsItems } from "./_components/news/newsItems.const"

// TODO APPDIRECTORY META

// This is the Homepage when not logged in.
export default async function Homepage() {
  await useAuthenticatedBlitzContext({ redirectAuthenticatedTo: "/dashboard" })

  return (
    <>
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

      <MarketingPagePhotos />

      <section className="mx-auto mt-16 w-full max-w-7xl px-6 pb-16 md:px-8">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-12 lg:max-w-none lg:grid-cols-2 lg:gap-y-20">
          <div className="flex flex-col gap-16">
            {newsItems.map((newsItem) => (
              <NewsItem key={newsItem.slug} article={newsItem} />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <MarketingPageContact />
            <MarketingPageLinks />
          </div>
        </div>
      </section>
    </>
  )
}
