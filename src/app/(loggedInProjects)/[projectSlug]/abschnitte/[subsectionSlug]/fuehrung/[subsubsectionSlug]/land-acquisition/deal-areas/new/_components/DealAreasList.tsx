"use client"

import { linkStyles } from "@/src/core/components/links/styles"
import { clsx } from "clsx"
import type { PotentialDealArea } from "./potentialDealAreaTypes"

type Props = {
  potentialDealAreas: PotentialDealArea[]
  setPotentialDealAreas: (areas: PotentialDealArea[]) => void
}

export function DealAreasList({ potentialDealAreas, setPotentialDealAreas }: Props) {
  const toggleAll = (selected: boolean) => {
    setPotentialDealAreas(potentialDealAreas.map((a) => ({ ...a, selected })))
  }

  const toggleOne = (id: string) => {
    setPotentialDealAreas(
      potentialDealAreas.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <button
          type="button"
          className={clsx(linkStyles, "font-medium underline hover:cursor-pointer")}
          onClick={() => {
            toggleAll(true)
          }}
        >
          Alle auswählen
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          className={clsx(linkStyles, "font-medium underline hover:cursor-pointer")}
          onClick={() => {
            toggleAll(false)
          }}
        >
          Keine auswählen
        </button>
      </div>
      <h3 className="text-sm font-semibold text-gray-900">Potenzielle Dealflächen</h3>
      <ul className="max-h-80 overflow-y-auto px-2 text-sm">
        {potentialDealAreas.length === 0 && (
          <li className="text-gray-500">Keine Flächen im Pufferbereich.</li>
        )}
        {potentialDealAreas.map((area) => (
          <li
            key={area.id}
            className={clsx(
              "border-b border-gray-100 p-2 last:border-b-0",
              area.selected ? "bg-blue-50" : "opacity-60",
            )}
          >
            <div className="flex break-inside-avoid items-start">
              <div className="flex h-5 items-center">
                <input
                  id={`deal-area-${area.id}`}
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={area.selected}
                  onChange={() => {
                    toggleOne(area.id)
                  }}
                />
              </div>
              <label
                htmlFor={`deal-area-${area.id}`}
                className={clsx(
                  "block min-w-0 flex-1 cursor-pointer pl-3 text-sm font-medium",
                  area.selected ? "text-gray-900" : "text-gray-400",
                )}
              >
                <span className="font-semibold">#{area.id}</span>{" "}
                <span className={area.selected ? "text-gray-600" : "text-gray-400"}>
                  area.alkisParcelId ({area.alkisParcelIdSource})
                </span>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
