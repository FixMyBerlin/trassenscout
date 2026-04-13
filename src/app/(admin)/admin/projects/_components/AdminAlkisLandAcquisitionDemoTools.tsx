"use client"

import { blueButtonStyles } from "@/src/core/components/links"
import deleteAlkisLandAcquisitionDemos from "@/src/server/admin/mutations/deleteAlkisLandAcquisitionDemos"
import seedAlkisLandAcquisitionDemos from "@/src/server/admin/mutations/seedAlkisLandAcquisitionDemos"
import { useMutation } from "@blitzjs/rpc"
import { MapIcon } from "@heroicons/react/16/solid"
import { useState } from "react"

export const AdminAlkisLandAcquisitionDemoTools = () => {
  const [seedMutation, { isLoading: seedLoading }] = useMutation(seedAlkisLandAcquisitionDemos)
  const [deleteMutation, { isLoading: deleteLoading }] = useMutation(deleteAlkisLandAcquisitionDemos)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const busy = seedLoading || deleteLoading

  const handleSeed = async () => {
    setError(null)
    setMessage(null)
    try {
      const result = await seedMutation({})
      setMessage(JSON.stringify(result, null, 2))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleDeleteDemos = async () => {
    setError(null)
    setMessage(null)
    if (
      !window.confirm(
        "Alle ALKIS-Demoprojekte unwiderruflich löschen? Dies kann nicht rückgängig gemacht werden.",
      )
    ) {
      return
    }
    try {
      const result = await deleteMutation({})
      setMessage(JSON.stringify(result, null, 2))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <section className="my-8 rounded-sm border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-lg font-semibold text-gray-900">ALKIS-Demoprojekte (Staging / Seed)</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-700">
        Legt die fünf Bundesland-Demo-Projekte idempotent an (Projekt, Abschnitt alkis-demo) oder
        entfernt sie wieder. Serverseitig nur erlaubt, wenn{" "}
        <code className="rounded bg-white px-1">NEXT_PUBLIC_APP_ENV</code> auf{" "}
        <code className="rounded bg-white px-1">staging</code> oder{" "}
        <code className="rounded bg-white px-1">development</code> steht (nicht Produktion).
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={blueButtonStyles}
          disabled={busy}
          onClick={() => void handleSeed()}
        >
          <MapIcon className="mr-1 inline size-4" />
          ALKIS-Demoprojekte anlegen / aktualisieren
        </button>
        <button
          type="button"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
          disabled={busy}
          onClick={() => void handleDeleteDemos()}
        >
          ALKIS-Demoprojekte löschen
        </button>
      </div>
      {message ? (
        <pre className="mt-4 max-h-64 overflow-auto rounded border border-gray-200 bg-white p-3 text-xs">
          {message}
        </pre>
      ) : null}
      {error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>
      ) : null}
    </section>
  )
}
