"use client"

import { linkStyles } from "@/src/core/components/links/styles"
import { clsx } from "clsx"
import type { PotentialAcquisitionArea } from "./potentialAcquisitionAreaTypes"

type Props = {
  potentialAcquisitionAreas: PotentialAcquisitionArea[]
  setPotentialAcquisitionAreas: (areas: PotentialAcquisitionArea[]) => void
}

export function AcquisitionAreasList({
  potentialAcquisitionAreas,
  setPotentialAcquisitionAreas,
}: Props) {
  const toggleAll = (selected: boolean) => {
    setPotentialAcquisitionAreas(
      potentialAcquisitionAreas.map((a) => (a.alkisParcelId != null ? { ...a, selected } : a)),
    )
  }

  const toggleOne = (id: string) => {
    setPotentialAcquisitionAreas(
      potentialAcquisitionAreas.map((a) => {
        if (a.id !== id || a.alkisParcelId == null) return a
        return { ...a, selected: !a.selected }
      }),
    )
  }

  const setExistingMode = (id: string, mode: "keep" | "update") => {
    setPotentialAcquisitionAreas(
      potentialAcquisitionAreas.map((a) => {
        if (a.id !== id || !a.existingAcquisitionAreaId) return a
        return { ...a, existingMode: mode }
      }),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <button
          type="button"
          className={clsx(linkStyles, "font-medium hover:cursor-pointer")}
          onClick={() => {
            toggleAll(false)
          }}
        >
          Keine auswählen
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          className={clsx(linkStyles, "font-medium hover:cursor-pointer")}
          onClick={() => {
            toggleAll(true)
          }}
        >
          Alles auswählen
        </button>
      </div>
      <ul className="space-y-0.5 text-sm">
        {potentialAcquisitionAreas.length === 0 && (
          <li className="text-gray-500">Keine Flächen im Pufferbereich.</li>
        )}
        {potentialAcquisitionAreas.map((area) => (
          <li
            key={area.id}
            className={clsx("px-3 py-3", area.selected ? "bg-blue-50" : "bg-transparent")}
          >
            <div className="flex break-inside-avoid items-start">
              <div className="flex h-5 items-center">
                <input
                  id={`acquisition-area-${area.id}`}
                  type="checkbox"
                  className="size-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  checked={area.selected}
                  disabled={area.alkisParcelId == null}
                  onChange={() => {
                    toggleOne(area.id)
                  }}
                />
              </div>
              <label
                htmlFor={`acquisition-area-${area.id}`}
                className={clsx(
                  "block min-w-0 flex-1 cursor-pointer pl-3 text-base",
                  area.selected ? "text-gray-900" : "text-gray-400",
                )}
              >
                <span className="font-semibold">#{area.id}</span>{" "}
                {area.alkisParcelId != null ? (
                  <>
                    <span className={area.selected ? "text-gray-800" : "text-gray-400"}>
                      {area.alkisParcelId}
                    </span>
                    <p
                      className={clsx(
                        "leading-tight",
                        area.selected ? "text-gray-600" : "text-gray-400",
                      )}
                    >
                      ({area.alkisParcelIdSource})
                    </p>
                    {area.existingAcquisitionAreaId && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-amber-700">
                          Bereits vorhanden als Verhandlungsfläche #{area.existingAcquisitionAreaId}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              name={`existing-mode-${area.id}`}
                              checked={area.existingMode === "keep"}
                              onChange={() => setExistingMode(area.id, "keep")}
                            />
                            Bestehende Geometrie behalten
                          </label>
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              name={`existing-mode-${area.id}`}
                              checked={area.existingMode === "update"}
                              onChange={() => setExistingMode(area.id, "update")}
                            />
                            Mit neuem Puffer aktualisieren
                          </label>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-red-400">Kein Flurstückskennzeichen</span>
                )}
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
