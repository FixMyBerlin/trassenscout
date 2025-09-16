"use client"

import { linkStyles } from "@/src/core/components/links"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { XMarkIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProtocolsTable } from "./ProtocolsTable"
import { useFilteredProtocols } from "./useFilteredProtocols"
import { useFilters } from "./useFilters.nuqs"

type FilteredProtocolsProps = {
  protocols: Awaited<ReturnType<typeof getProtocols>>
  highlightId: number | null
}

export const FilteredProtocols = ({ protocols, highlightId }: FilteredProtocolsProps) => {
  const router = useRouter()
  const { filter, setFilter } = useFilters()
  const [searchterm, setSearchterm] = useState("")

  const filteredProtocols = useFilteredProtocols(protocols)

  // filter / state logic copied from EditableSurveyResponseFilterForm
  // Sync local searchterm state with URL
  useEffect(() => {
    setSearchterm(filter?.searchterm || "")
  }, [filter])

  // Scroll to filter input and list when there's a search term from navigation
  useEffect(() => {
    if (filter?.searchterm && window.location.hash === "#filter") {
      const filterElement = document.getElementById("protocol-filter")
      if (filterElement) filterElement.scrollIntoView({ behavior: "smooth", block: "start" })
      // Remove the hash so subsequent search updates don't trigger scroll
      const urlWithoutHash = window.location.pathname + window.location.search
      router.replace(urlWithoutHash as any)
    }
  }, [filter?.searchterm, router])

  const handleSearchtermInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearchterm(value)
  }

  // maybe we need this again when we have multiple filters/ forms / buttons see EditableSurveyResponseFilterForm
  // const handleSearchtermInputBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
  //   const { value } = event.target
  //   await setFilter({
  //     searchterm: value,
  //   })
  // }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await setFilter({
      ...filter,
      searchterm,
    })
  }

  const handleFilterReset = async () => {
    setSearchterm("")
    await setFilter({
      searchterm: "",
    })
  }

  return (
    <>
      <form id="protocol-filter" onSubmit={handleSubmit}>
        <div className="flex items-end gap-4">
          <div className="w-[300px]">
            <input
              onChange={handleSearchtermInputChange}
              type="text"
              value={searchterm}
              // onBlur={handleSearchtermInputBlur}
              name="searchterm"
              placeholder="Beiträge nach Suchwort filtern"
              className={
                "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              }
            />
          </div>
          <button type="submit" className="h-full">
            <MagnifyingGlassIcon className="h-9 w-9 rounded-md bg-blue-500 p-2 text-white hover:bg-blue-800" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Tags, Titel, Inhalte und Abschnitte durchsuchen
        </p>
      </form>
      <button
        type="button"
        className={clsx(linkStyles, "mt-4 flex items-center gap-2")}
        onClick={handleFilterReset}
      >
        <XMarkIcon className="h-4 w-4" />
        <span>Filter zurücksetzen</span>
      </button>
      <p className="mt-4 text-sm text-gray-500">
        {filteredProtocols.length} Protokoll{filteredProtocols.length !== 1 ? "e" : ""}
      </p>
      {protocols.length === 0 ? (
        <ZeroCase visible={protocols.length} name="Protokolle" />
      ) : (
        <ProtocolsTable protocols={filteredProtocols} highlightId={highlightId} />
      )}
    </>
  )
}
