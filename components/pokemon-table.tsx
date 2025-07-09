"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Pagination } from "@/components/pagination"
import PokemonModal from "./pokemon-modal"

export interface Pokemon {
  name: string
  url: string
  id: number
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}

interface PokemonTableProps {
  pokemonData: PokemonListResponse
  searchResult: any
  currentPage: number
  searchQuery: string
}

const columnHelper = createColumnHelper<Pokemon>()

export default function PokemonTable({ pokemonData, searchResult, currentPage, searchQuery }: PokemonTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [sorting, setSorting] = useState<SortingState>([])

  const limit = 20

  // Transform data to include IDs for TanStack Table
  const tableData = useMemo(() => {
    if (searchResult) {
      return [
        {
          name: searchResult.name,
          url: `https://pokeapi.co/api/v2/pokemon/${searchResult.id}/`,
          id: searchResult.id,
        },
      ]
    }

    return pokemonData.results.map((pokemon, index) => ({
      ...pokemon,
      id: (currentPage - 1) * limit + index + 1,
    }))
  }, [pokemonData.results, searchResult, currentPage, limit])

  // Columns for DataTable
  const columns: ColumnDef<Pokemon>[] = [
    {
      accessorKey: "id",
      header: "ID",
      sortingFn: "basic",
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: "alphanumeric",
    },
  ]

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSortingRemoval: true,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams?.toString())
    if (searchInput.trim()) {
      params.set("search", searchInput.trim())
      params.delete("page")
    } else {
      params.delete("search")
    }
    router.push(`/?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    if (newPage === 1) {
      params.delete("page")
    } else {
      params.set("page", newPage.toString())
    }
    router.push(`/?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchInput("")
    const params = new URLSearchParams(searchParams?.toString())
    params.delete("search")
    params.delete("page")
    router.push(`/?${params.toString()}`)
  }

  const totalPages = Math.ceil(pokemonData.count / limit)

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search Pokémon by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
        {searchQuery && (
          <Button type="button" variant="outline" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </form>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant={searchResult ? "default" : "destructive"}>
            {searchResult ? `Found: ${searchResult.name}` : `No results for "${searchQuery}"`}
          </Badge>
        </div>
      )}

      {/* TanStack Table */}
      <DataTable table={table} onRowClick={(row) => setSelectedPokemon(row.name)} />

      {/* Pagination - Only show if not searching */}
      {!searchQuery && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={limit}
          totalCount={pokemonData.count}
          label="Pokémon"
        />
      )}

      {/* Modal */}
      {selectedPokemon && (
        <PokemonModal
          pokemonName={selectedPokemon}
          isOpen={!!selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  )
}
