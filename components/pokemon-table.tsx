import type React from "react"
import { useState, useMemo } from "react"
import type { Pokemon, PokemonListResponse } from "@/types/pokemon"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
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

interface PokemonTableProps {
  currentPage: number
  searchQuery: string
  pokemonData: PokemonListResponse | null
}

export default function PokemonTable({ currentPage, searchQuery, pokemonData }: PokemonTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [sorting, setSorting] = useState<SortingState>([])

  const limit = 10

  const isLoading = !pokemonData
  const error = null // SSR errors handled in getServerSideProps

  // Transform data to include IDs for TanStack Table
  const tableData = useMemo(() => {
    if (!pokemonData) return []
    if (pokemonData && pokemonData.results && searchQuery && pokemonData.results.length === 1) {
      const result = pokemonData.results[0]
      return [{
        name: result.name,
        url: result.url,
        id: result.id || 1,
      }]
    }
    return pokemonData.results.map((pokemon, index) => ({
      ...pokemon,
      id: (currentPage - 1) * limit + index + 1,
    }))
  }, [pokemonData, currentPage, limit, searchQuery])

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

  const totalPages = pokemonData ? Math.ceil(pokemonData.count / limit) : 1

  if (isLoading) {
    return <div className="py-8 text-center">Loading Pokémon...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-destructive">Error loading Pokémon data.</div>
  }

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
          <Badge variant={tableData.length ? "default" : "destructive"}>
            {tableData.length ? `Found: ${tableData[0].name}` : `No results for "${searchQuery}"`}
          </Badge>
        </div>
      )}

      {/* TanStack Table */}
      <DataTable table={table} onRowClick={(row) => setSelectedPokemon(row.name)} />

      {/* Pagination - Only show if not searching */}
      {!searchQuery && pokemonData && (
        <div className="flex items-center gap-2 overflow-x-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={limit}
            totalCount={pokemonData.count}
            label="Pokémon"
          />
        </div>
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
